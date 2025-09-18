import pandas as pd
import geopandas as gpd
from sklearn.preprocessing import MinMaxScaler
from shapely.geometry import Point
import warnings
from sqlalchemy import create_engine

# Ignore nuisance warnings for a cleaner output
warnings.filterwarnings('ignore', 'Geometry is in a geographic CRS')

print("--- Starting the Complete DSS Engine (Hybrid Mode: DB + Local Files) ---")

try:
    # --- STEP 1: LOAD CLAIMANT DATA FROM DATABASE ---
    # !!! IMPORTANT: Replace with your actual database credentials !!!
    db_connection_str = 'postgresql://neondb_owner:npg_ZavzEIqCGM74@ep-calm-bird-ad99tbj1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    db_engine = create_engine(db_connection_str)
    print("✅ 1. Connecting to the database...")

    # Define the corrected SQL query, now including the 'id' column
    sql_query = """
    SELECT
        id                                  AS "claim_id", -- Added claim ID
        claimant_name                       AS "Claimant Name",
        age                                 AS "Age",
        gender                              AS "Gender",
        state                               AS "State",
        district                            AS "District",
        block_tehsil                        AS "Block/Tehsil",
        gram_panchayat                      AS "Gram Panchayat",
        village                             AS "Village",
        category                            AS "Category",
        tax_payer                           AS "Tax Payer",
        claim_type                          AS "Claim Type",
        status_of_claim                     AS "Status of Claim",
        annual_income                       AS "Annual Income",
        land_use                            AS "Land Use",
        geo_coordinates                     AS "Geo-Coordinates"
    FROM
        claims;
    """

    # Fetch the data into a pandas DataFrame
    df = pd.read_sql(sql_query, db_engine)

    # Perform data cleaning on the loaded data
    df[['Latitude', 'Longitude']] = df['Geo-Coordinates'].str.split(', ', expand=True)
    df['Latitude'] = pd.to_numeric(df['Latitude'], errors='coerce')
    df['Longitude'] = pd.to_numeric(df['Longitude'], errors='coerce')
    df['Annual Income'] = pd.to_numeric(df['Annual Income'], errors='coerce')
    df.dropna(subset=['Latitude', 'Longitude'], inplace=True)

    # Impute missing Annual Income values
    village_median_income = df.groupby('Village')['Annual Income'].transform('median')
    df['Annual Income'].fillna(village_median_income, inplace=True)
    global_median_income = df['Annual Income'].median()
    df['Annual Income'].fillna(global_median_income, inplace=True)
    print("✅ 1. Claimant data (including ID) loaded and cleaned from database.")


    # --- STEP 2: LOAD WATERBODY DATA FROM LOCAL FILES & PROCESS ---
    state_to_file_map = {
        'Tripura': 'DWA Waterbodies Ph2 for Tripura.geojson',
        'Madhya Pradesh': 'DWA Waterbodies Ph1 for Madhya Pradesh.geojson',
        'Odisha': 'DWA Waterbodies Ph1 for Odisha.geojson',
        'Telangana': 'DWA Waterbodies Ph2 for Telangana.geojson'
    }

    processed_states = []

    print("✅ 2. Starting geospatial processing using local GeoJSON files...")
    for state_name, geojson_file in state_to_file_map.items():
        print(f"  -> Processing {state_name}...")

        state_claimants_df = df[df['State'] == state_name].copy()
        if state_claimants_df.empty:
            continue

        waterbodies_gdf = gpd.read_file(geojson_file)

        claimants_gdf = gpd.GeoDataFrame(
            state_claimants_df,
            geometry=gpd.points_from_xy(state_claimants_df.Longitude, state_claimants_df.Latitude),
            crs="EPSG:4326"
        )

        claimants_proj = claimants_gdf.to_crs("EPSG:7755")
        waterbodies_proj = waterbodies_gdf.to_crs("EPSG:7755")

        merged_state_gdf = gpd.sjoin_nearest(
            claimants_proj,
            waterbodies_proj,
            how="left",
            distance_col="distance_meters"
        )

        processed_states.append(merged_state_gdf)

    accurate_df = pd.concat(processed_states, ignore_index=True)
    print("✅ 2. Geospatial processing complete. Distances are accurate.")

    # --- STEPS 3 and 4 remain IDENTICAL ---
    # --- STEP 3: CALCULATE ALL VILLAGE-LEVEL PRIORITY INDICES ---
    print("✅ 3. Calculating village-level priority indices...")
    accurate_df['distance_meters'].fillna(accurate_df['distance_meters'].max(), inplace=True)

    village_stats = accurate_df.groupby(['State', 'District', 'Village']).agg(
        avg_distance_meters=('distance_meters', 'mean'),
        claimant_count=('Claimant Name', 'count'),
        percent_agri=('Land Use', lambda x: (x == 'Agriculture').sum() / len(x) * 100),
        avg_annual_income=('Annual Income', 'mean'),
        percent_insecure_tenure=('Status of Claim', lambda x: (x != 'Approved').sum() / len(x) * 100)
    ).reset_index()

    scaler = MinMaxScaler()
    village_stats[['dist_norm', 'agri_norm', 'count_norm', 'income_norm', 'tenure_norm']] = scaler.fit_transform(
        village_stats[['avg_distance_meters', 'percent_agri', 'claimant_count', 'avg_annual_income', 'percent_insecure_tenure']]
    )
    village_stats['income_need_score'] = 1 - village_stats['income_norm']

    village_stats['Jal_Jeevan_Mission_Priority'] = ((village_stats['dist_norm'] * 0.5) + (village_stats['count_norm'] * 0.3) + (village_stats['agri_norm'] * 0.2))
    village_stats['DAJGUA_Priority'] = ((village_stats['income_need_score'] * 0.5) + (village_stats['tenure_norm'] * 0.5))
    village_stats['MGNREGA_Priority'] = ((village_stats['income_need_score'] * 0.6) + (village_stats['agri_norm'] * 0.4))

    # --- STEP 4: CALCULATE INDIVIDUAL-LEVEL PRIORITY SCORES ---
    print("✅ 4. Calculating individual-level priority scores...")

    final_df = pd.merge(accurate_df, village_stats, on=['State', 'District', 'Village'], how='left')

    final_df['PMAY_Priority'] = 0.0
    final_df['PM_KISAN_Priority'] = 0.0

    pmay_eligible_mask = (final_df['Category'] == 'ST') & (final_df['Annual Income'] < 250000)
    if pmay_eligible_mask.sum() > 0:
        pmay_incomes = final_df.loc[pmay_eligible_mask, ['Annual Income']]
        final_df.loc[pmay_eligible_mask, 'PMAY_Priority'] = 1 - scaler.fit_transform(pmay_incomes)

    pmkisan_eligible_mask = (final_df['Land Use'] == 'Agriculture') & (final_df['Tax Payer'] == 'No')
    if pmkisan_eligible_mask.sum() > 0:
        pmkisan_incomes = final_df.loc[pmkisan_eligible_mask, ['Annual Income']]
        final_df.loc[pmkisan_eligible_mask, 'PM_KISAN_Priority'] = 1 - scaler.fit_transform(pmkisan_incomes)

    priority_cols = ['Jal_Jeevan_Mission_Priority', 'DAJGUA_Priority', 'MGNREGA_Priority', 'PM_KISAN_Priority', 'PMAY_Priority']
    for col in priority_cols:
        final_df[col] = final_df[col].clip(0, 1)

    # --- STEP 5: ASSEMBLE, SORT, AND SAVE THE FINAL FILE ---
    print("✅ 5. Assembling the definitive master file...")
    
    # Sort the final dataframe by the claim_id to maintain database order
    final_df.sort_values(by='claim_id', inplace=True)

    # Define the final column order, with claim_id at the front
    final_ordered_cols = [
        'claim_id', 'Claimant Name', 'Age', 'Gender', 'State', 'District', 'Block/Tehsil',
        'Gram Panchayat', 'Village', 'Category', 'Tax Payer', 'Claim Type',
        'Status of Claim', 'Annual Income', 'Jal_Jeevan_Mission_Priority',
        'DAJGUA_Priority', 'MGNREGA_Priority', 'PM_KISAN_Priority', 'PMAY_Priority'
    ]
    final_df = final_df[final_ordered_cols]

    final_df.to_csv('dss_definitive_master_db_new.csv', index=False)

    print("\n✅✅✅ DSS ENGINE COMPLETE! ✅✅✅")
    print("      -> A single, definitive file has been saved as 'dss_definitive_master.csv'")

    print("\n--- Preview of the Final DSS Database ---")
    print(final_df.head())

except FileNotFoundError as e:
    print(f"❌ ERROR: A required local file was not found. Please ensure all .geojson files are present. Missing file: {e.filename}")
except Exception as e:
    print(f"An unexpected error occurred while connecting to the database or processing data: {e}")