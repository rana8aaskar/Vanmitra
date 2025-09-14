import spacy
import easyocr
import os
import json
import pandas as pd
import re

# Paths for model and output
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model-best", "content", "model-best")
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "fra_data.csv")
IMAGE_PATH = os.path.join(os.path.dirname(__file__), "output_new.png")

# Load the trained NER model
nlp = spacy.load(MODEL_PATH)

# Function to extract text from image using EasyOCR
def extract_text_from_image(image_path):
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_path, detail=0)
    return "\n".join(result)

# Function to clean and preprocess OCR text
def preprocess_ocr_text(text):
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'[ ]{2,}', ' ', text)
    text = re.sub(r'(Age|Gender|Aadhaar No):\s*\n\s*(\S+)', r'\1: \2', text, flags=re.IGNORECASE)

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
        r'Lsngcirg': ''
    }
    for pattern, repl in corrections.items():
        text = re.sub(pattern, repl, text)

    text = re.split(r'Claimant Signature', text, flags=re.IGNORECASE)[0]
    return text

# Function to extract entities using the NER model
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

# Function to save extracted entities to CSV file
def save_to_csv(entities, csv_file):
    if not entities:
        return
    df = pd.DataFrame([entities])
    if not os.path.isfile(csv_file):
        df.to_csv(csv_file, index=False)
    else:
        df.to_csv(csv_file, mode='a', header=False, index=False)

# Main process
if __name__ == "__main__":
    text = extract_text_from_image(IMAGE_PATH)
    clean_text = preprocess_ocr_text(text)
    extracted_entities = extract_ner_fields(clean_text, nlp)
    save_to_csv(extracted_entities, OUTPUT_CSV)
