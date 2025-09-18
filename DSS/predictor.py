from sqlalchemy import create_engine
import pandas as pd
import joblib

# !!! IMPORTANT: Replace with your actual database credentials !!!
db_connection_str = 'postgresql://neondb_owner:npg_ZavzEIqCGM74@ep-calm-bird-ad99tbj1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
db_engine = create_engine(db_connection_str)

def get_ml_prediction_for_claim_id(claim_id, con):
    """
    Predicts DSS priority scores for a specific claimant by using the saved ML model
    on their village's characteristics.
    """
    try:
        # 1. Find the village for the given claim_id from your live database
        claimant_query = f"SELECT village FROM claims WHERE id = {claim_id};"
        claimant_df = pd.read_sql(claimant_query, con)
        
        if claimant_df.empty:
            return f"Error: No claimant found with id: {claim_id}"
        
        village_name = claimant_df['village'].iloc[0]

        # 2. Fetch the pre-calculated raw features for that village FROM THE CSV
        all_village_stats = pd.read_csv('dss_village_stats.csv')
        village_stats_df = all_village_stats[all_village_stats['Village'] == village_name]

        if village_stats_df.empty:
            return f"Error: Statistics not found for village '{village_name}' in the CSV."
        
        # 3. Load the pre-trained ML model
        model = joblib.load('dss_model.joblib')

        # 4. Prepare the features and predict
        features_order = [
            'avg_distance_meters', 
            'claimant_count', 
            'percent_agri', 
            'avg_annual_income', 
            'percent_insecure_tenure'
        ]
        village_features = village_stats_df[features_order]
        predicted_scores = model.predict(village_features)
        
        # 5. Format and return the results
        results = {
            'claim_id': claim_id,
            'Village': village_name,
            'Predicted_Jal_Jeevan_Mission_Priority': predicted_scores[0, 0],
            'Predicted_DAJGUA_Priority': predicted_scores[0, 1],
            'Predicted_MGNREGA_Priority': predicted_scores[0, 2],
            'Predicted_PM_KISAN_Priority_Avg': predicted_scores[0, 3],
            'Predicted_PMAY_Priority_Avg': predicted_scores[0, 4]
        }
        return pd.DataFrame([results])

    except FileNotFoundError as e:
        return f"❌ Error: A required file was not found. Ensure 'dss_village_stats.csv' and 'dss_model.joblib' are present. Missing file: {e.filename}"
    except Exception as e:
        return f"An error occurred: {e}"

