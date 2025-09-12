import spacy
import easyocr
import os
import json
import pandas as pd
import re

# Load your trained NER model
MODEL_PATH = r"E:\sih\Faker\pipeline\model-best\content\model-best"
nlp = spacy.load(MODEL_PATH)

# CSV file name
OUTPUT_CSV = "fra_data.csv"

# OCR extraction function
def extract_text_from_image(image_path):
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_path, detail=0)
    text = "\n".join(result)
    return text

# Preprocess OCR text to normalize labels and values
def preprocess_ocr_text(text):
    # Remove excessive spaces and repeated newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'[ ]{2,}', ' ', text)

    # Merge multi-line label-value pairs like Age, Gender, Aadhaar
    text = re.sub(r'(Age|Gender|Aadhaar No):\s*\n\s*(\S+)', r'\1: \2', text, flags=re.IGNORECASE)

    # Merge other multi-line labels (District, Gram Panchayat, Block, Tehsil, etc.)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    merged_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.endswith(':') and i + 1 < len(lines):
            next_line = lines[i + 1]
            if not next_line.endswith(':'):
                line = f"{line} {next_line}"
                i += 1
        merged_lines.append(line)
        i += 1

    # Join everything into one single line
    text = ' '.join(merged_lines)

    # Common OCR corrections
    corrections = {
        r'\b0fficer\b': 'Officer',
        r'\bBorewe11\b': 'Borewell',
        r'\bJa1\b': 'Jal',
        r'\bC1aimant\b': 'Claimant',
        r'\bC1aim\b': 'Claim',
        r'\bVi11age\b': 'Village',
        r'\bTehsi1\b': 'Tehsil',
        r'\bIs1and\b': 'Island',
        r'\bE11is\b': 'Ellis',
        r'\bB1ake\b': 'Blake',
        r'\bRache1\b': 'Rachel',
        r'Lsngcirg': ''  # Clean OCR prefix in Geo coordinates
    }
    for pattern, repl in corrections.items():
        text = re.sub(pattern, repl, text)
    text = re.split(r'Claimant Signature', text, flags=re.IGNORECASE)[0]

    return text

# NER extraction function
def extract_ner_fields(text, nlp):
    doc = nlp(text)
    data = {}
    for ent in doc.ents:
        ent_text = ent.text.strip().replace('\n', ' ')
        if ent.label_ in data:
            data[ent.label_] += " | " + ent_text
        else:
            data[ent.label_] = ent_text
    return data

# Save extracted entities to CSV
def save_to_csv(entities, csv_file):
    df = pd.DataFrame([entities])
    if not os.path.isfile(csv_file):
        df.to_csv(csv_file, index=False)
    else:
        df.to_csv(csv_file, mode='a', header=False, index=False)
    print(f"\nData saved to {csv_file}")

# Main pipeline
if __name__ == "__main__":
    image_path = "output_new.png"  # Path to your image file
    print(f"Processing image: {image_path}\n")

    # Step 1: Extract text from image using OCR
    text = extract_text_from_image(image_path)
    print("--- OCR Extracted Text ---\n")
    print(text)

    # Step 2: Preprocess OCR text into single-line format
    clean_text = preprocess_ocr_text(text)
    print("\n--- Preprocessed Text ---\n")
    print(clean_text)

    # Step 3: Feed preprocessed text to the NER model
    extracted_entities = extract_ner_fields(clean_text, nlp)
    print("\n--- Extracted Entities ---\n")
    print(json.dumps(extracted_entities, indent=4))

    # Step 4: Save the extracted entities to CSV
    save_to_csv(extracted_entities, OUTPUT_CSV)
