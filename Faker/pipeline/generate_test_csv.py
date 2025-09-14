import csv
import os
from datetime import datetime

# Sample data matching your CSV structure
sample_data = {
    'CLAIMANT_NAME': 'Gaurika Edwin',
    'SPOUSE_NAME': 'Chaltanya Bhargava',
    'PATTA_TITLE_NO': 'WW87343',
    'AADHAAR_NO': '192995350383',
    'CATEGORY': '2',
    'VILLAGE': 'Nimapada',
    'GRAM_PANCHAYAT': 'Nimapada GP',
    'TEHSIL': 'Puri Tehsil',
    'DISTRICT': 'Puri',
    'STATE': 'Odisha',
    'CLAIM_TYPE': 'CFR',
    'LAND_CLAIMED': '15 hectares',
    'LAND_USE': 'Agriculture',
    'ANNUAL_INCOME': '1849794',
    'TAX_PAYER': 'Yes',
    'BOUNDARY_DESCRIPTION': 'No 548, Choudhury Marg',
    'GEO_COORDINATES': '20.8535 82.3705',
    'STATUS_OF_CLAIM': 'Approved',
    'DATE_OF_SUBMISSION': '12/03/2021',
    'DATE_OF_DECISION': '23/12/2022',
    'WATER_BODY': 'Pond',
    'IRRIGATION_SOURCE': 'Canal',
    'INFRASTRUCTURE_PRESENT': 'Road'
}

# Write to CSV
csv_file = 'fra_data.csv'
with open(csv_file, 'w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=sample_data.keys())
    writer.writeheader()
    writer.writerow(sample_data)

print(f"Test CSV created: {csv_file}")
print(f"Data: {sample_data}")