import sys
import json
import spacy
import easyocr
import os
import re
from pathlib import Path

# Get the directory of this script
SCRIPT_DIR = Path(__file__).parent

# Paths for model
MODEL_PATH = SCRIPT_DIR / "model-best" / "content" / "model-best"

# Initialize once
try:
    nlp = spacy.load(str(MODEL_PATH))
    reader = easyocr.Reader(['en'])
except Exception as e:
    print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
    sys.exit(1)

def extract_text_from_image(image_path):
    """Extract text from image using EasyOCR"""
    try:
        result = reader.readtext(image_path, detail=0)
        return "\n".join(result)
    except Exception as e:
        return None

def preprocess_ocr_text(text):
    """Clean and preprocess OCR text"""
    if not text:
        return ""

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
    }
    for pattern, repl in corrections.items():
        text = re.sub(pattern, repl, text)

    text = re.split(r'Claimant Signature', text, flags=re.IGNORECASE)[0]
    return text

def extract_ner_fields(text):
    """Extract entities using the NER model"""
    if not text:
        return {}

    doc = nlp(text)
    data = {}

    # Map NER entities to database fields
    field_mapping = {
        'CLAIMANT_NAME': 'name',
        'FATHER_HUSBAND_NAME': 'father_husband_name',
        'VILLAGE': 'village',
        'PANCHAYAT': 'panchayat',
        'BLOCK': 'tehsil',
        'TEHSIL': 'tehsil',
        'DISTRICT': 'district',
        'STATE': 'state',
        'LAND_AREA': 'area_of_land',
        'KHASRA_NO': 'khasra_number',
        'PATTA_NO': 'khasra_number',
        'LAND_TYPE': 'nature_of_possession',
        'BOUNDARY': 'boundary_north',
        'ADDRESS': 'address',
    }

    for ent in doc.ents:
        ent_text = ent.text.strip().replace('\n', ' ')
        field_name = field_mapping.get(ent.label_, ent.label_.lower())

        if field_name in data:
            data[field_name] += " | " + ent_text
        else:
            data[field_name] = ent_text

    return data

def process_image(image_path):
    """Main processing function"""
    try:
        # Extract text from image
        text = extract_text_from_image(image_path)
        if not text:
            return {
                "success": False,
                "error": "Failed to extract text from image",
                "extracted_data": {}
            }

        # Preprocess text
        clean_text = preprocess_ocr_text(text)

        # Extract entities
        extracted_data = extract_ner_fields(clean_text)

        return {
            "success": True,
            "extracted_data": extracted_data,
            "raw_text": text[:500],  # First 500 chars for debugging
            "processed_text": clean_text[:500]
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "extracted_data": {}
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path required"}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)

    result = process_image(image_path)
    print(json.dumps(result, ensure_ascii=False))