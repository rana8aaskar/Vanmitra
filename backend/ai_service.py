from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import spacy
import easyocr
import os
import json
import re
import tempfile
from pathlib import Path

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Paths for models
FAKER_PIPELINE_PATH = os.path.join(os.path.dirname(__file__), '..', 'Faker', 'pipeline')
MODEL_PATH = os.path.join(FAKER_PIPELINE_PATH, "model-best", "content", "model-best")

# Global variables for models
nlp = None
reader = None

def load_spacy_model():
    """Load only the spaCy NER model at startup"""
    global nlp
    try:
        print("Loading spaCy NER model...")
        if os.path.exists(MODEL_PATH):
            nlp = spacy.load(MODEL_PATH)
            print("✓ spaCy model loaded successfully")
            print(f"Model labels: {nlp.get_pipe('ner').labels}")
            return True
        else:
            print("⚠ spaCy model not found, will use regex fallback")
            nlp = None
            return True
    except Exception as e:
        print(f"Error loading spaCy model: {e}")
        nlp = None
        return True  # Continue even if spaCy fails

def load_easyocr():
    """Load EasyOCR reader when needed"""
    global reader
    if reader is None:
        try:
            print("Loading EasyOCR reader...")
            reader = easyocr.Reader(['en'])
            print("✓ EasyOCR reader loaded successfully")
        except Exception as e:
            print(f"Error loading EasyOCR: {e}")
            reader = None
    return reader is not None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_image(image_path):
    """Extract text from image using EasyOCR"""
    try:
        # Load EasyOCR if not already loaded
        if not load_easyocr():
            print("Failed to load EasyOCR")
            return None
            
        result = reader.readtext(image_path, detail=0)
        return "\n".join(result)
    except Exception as e:
        print(f"OCR Error: {e}")
        return None

def preprocess_ocr_text(text):
    """Clean and preprocess OCR text using the same logic as your pipeline"""
    if not text:
        return ""
    
    # Basic cleaning
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

    # Common OCR corrections from your pipeline
    corrections = {
        r'\b0fficer\b': 'Officer',
        r'\bBorewe11\b': 'Borewell',
        r'\bJa1\b': 'Jal',
        r'\bC1aimant\b': 'Claimant',
        r'\bC1aim\b': 'Claim',
        r'\bVi11age\b': 'Village',
        r'\bDistr1ct\b': 'District',
        r'\bState\b': 'State',
        r'\bPatt1\b': 'Patta',
        r'\bAadhaar\b': 'Aadhaar',
        r'\bTehs1l\b': 'Tehsil',
        r'\bPanchayat\b': 'Panchayat',
        r'\bTehsi1\b': 'Tehsil',
        r'\bIs1and\b': 'Island',
        r'\bE11is\b': 'Ellis',
        r'\bB1ake\b': 'Blake',
        r'\bRache1\b': 'Rachel',
        r'Lsngcirg': ''
    }
    
    for pattern, repl in corrections.items():
        text = re.sub(pattern, repl, text)

    # Remove text after "Claimant Signature"
    text = re.split(r'Claimant Signature', text, flags=re.IGNORECASE)[0]
    
    return text

def extract_entities_with_spacy(text):
    """Extract entities using the trained spaCy NER model"""
    if not text or not nlp:
        return {}
    
    try:
        doc = nlp(text)
        entities = {}
        
        print(f"Processing text with spaCy model...")
        print(f"Found {len(doc.ents)} entities")
        
        for ent in doc.ents:
            label = ent.label_.lower()
            value = ent.text.strip().replace('\n', ' ')
            
            print(f"Entity: {label} -> {value}")
            
            # Map spaCy labels to our field names
            field_mapping = {
                'claimant_name': ['claimant', 'name', 'person'],
                'spouse_name': ['spouse', 'father', 'husband'],
                'village': ['village', 'gram'],
                'district': ['district'],
                'state': ['state'],
                'patta_title_no': ['patta', 'title', 'khasra'],
                'aadhaar_no': ['aadhaar', 'adhar'],
                'land_claimed': ['area', 'land', 'hectare', 'acre'],
                'category': ['category', 'caste'],
                'claim_type': ['claim', 'type'],
                'land_use': ['use', 'purpose'],
                'annual_income': ['income', 'annual'],
                'tax_payer': ['tax', 'payer'],
                'boundary_description': ['boundary', 'north', 'south', 'east', 'west'],
                'geo_coordinates': ['coordinate', 'latitude', 'longitude'],
                'status_of_claim': ['status', 'approved', 'rejected', 'pending'],
                'water_body': ['water', 'pond', 'river', 'well'],
                'irrigation_source': ['irrigation', 'canal', 'well'],
                'infrastructure_present': ['infrastructure', 'road', 'school', 'hospital']
            }
            
            for field, labels in field_mapping.items():
                if any(label in label.lower() for label in labels):
                    if field not in entities or len(value) > len(entities[field]):
                        entities[field] = value
                    break
        
        print(f"Extracted entities: {entities}")
        return entities
    except Exception as e:
        print(f"spaCy processing error: {e}")
        return {}

def extract_fields_with_regex(text):
    """Extract fields using regex patterns from your process_image_simple.py"""
    if not text:
        return {}

    data = {}

    # Enhanced patterns for FRA forms (from your script)
    patterns = {
        'claimant_name': r"(?:Name|Claimant|नाम)[:\s]*([A-Za-z\s]+?)(?:\n|$|Father|Husband)",
        'spouse_name': r"(?:Father|Husband|पिता|पति)[:\s]*(?:Name|नाम)?[:\s]*([A-Za-z\s]+?)(?:\n|$)",
        'village': r"(?:Village|गांव|ग्राम)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'gram_panchayat': r"(?:Panchayat|पंचायत|Gram\s*Panchayat)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'tehsil': r"(?:Tehsil|Block|तहसील|ब्लॉक)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'district': r"(?:District|जिला)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'state': r"(?:State|राज्य)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'land_claimed': r"(?:Area|Land\s*Area|क्षेत्र)[:\s]*([0-9.]+\s*(?:hectare|acre|हेक्टेयर|एकड़)?)",
        'patta_title_no': r"(?:Khasra|Patta|खसरा|पट्टा)[:\s]*(?:No|Number|संख्या)?[:\s]*([A-Za-z0-9/\-]+)",
        'aadhaar_no': r"(?:Aadhaar|Adhar|आधार)[:\s]*(?:No|Number|संख्या)?[:\s]*([0-9\s]+)",
        'category': r"(?:Category|Caste|श्रेणी|जाति)[:\s]*([A-Za-z0-9\s]+)",
        'claim_type': r"(?:Claim\s*Type|Type\s*of\s*Claim|दावे का प्रकार)[:\s]*([A-Za-z\s]+)",
        'land_use': r"(?:Land\s*Use|Use\s*of\s*Land|भूमि का उपयोग)[:\s]*([A-Za-z\s]+)",
        'annual_income': r"(?:Annual\s*Income|Income|वार्षिक आय)[:\s]*([0-9,]+)",
        'tax_payer': r"(?:Tax\s*Payer|Taxpayer|करदाता)[:\s]*(Yes|No|हाँ|नहीं)",
        'status_of_claim': r"(?:Status|Status\s*of\s*Claim|स्थिति)[:\s]*(Approved|Rejected|Pending|मंजूर|अस्वीकृत|लंबित)",
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            data[field] = match.group(1).strip()

    # Extract boundaries
    boundary_pattern = r"(?:North|South|East|West|उत्तर|दक्षिण|पूर्व|पश्चिम)[:\s]*([A-Za-z\s,]+?)(?:\n|$)"
    boundaries = re.findall(boundary_pattern, text, re.IGNORECASE | re.MULTILINE)

    if boundaries:
        boundary_desc = []
        if len(boundaries) > 0:
            boundary_desc.append(f"North: {boundaries[0].strip()}")
        if len(boundaries) > 1:
            boundary_desc.append(f"South: {boundaries[1].strip()}")
        if len(boundaries) > 2:
            boundary_desc.append(f"East: {boundaries[2].strip()}")
        if len(boundaries) > 3:
            boundary_desc.append(f"West: {boundaries[3].strip()}")
        
        if boundary_desc:
            data['boundary_description'] = ", ".join(boundary_desc)

    return data

def process_document(file_path):
    """Main function to process a document and extract data"""
    try:
        print(f"Processing file: {file_path}")
        
        # Extract text using OCR
        raw_text = extract_text_from_image(file_path)
        
        if not raw_text:
            return {
                "success": False,
                "error": "Could not extract text from image",
                "extracted_data": {}
            }
        
        print(f"Extracted text length: {len(raw_text)} characters")
        print(f"Raw text preview: {raw_text[:200]}...")
        
        # Preprocess text using your pipeline logic
        processed_text = preprocess_ocr_text(raw_text)
        print(f"Processed text length: {len(processed_text)} characters")
        print(f"Processed text preview: {processed_text[:200]}...")
        
        # Extract entities using spaCy NER model (if available)
        spacy_entities = extract_entities_with_spacy(processed_text)
        print(f"spaCy extracted {len(spacy_entities)} entities")
        
        # Extract fields using regex patterns from your script
        regex_entities = extract_fields_with_regex(processed_text)
        print(f"Regex extracted {len(regex_entities)} entities")
        
        # Combine results (spaCy takes priority, but regex fills gaps)
        final_data = {**regex_entities, **spacy_entities}
        
        # Clean up the data
        cleaned_data = {}
        for key, value in final_data.items():
            if value and str(value).strip():
                cleaned_data[key] = str(value).strip()
        
        print(f"Final extracted data: {len(cleaned_data)} fields")
        print(f"Extracted fields: {list(cleaned_data.keys())}")
        
        return {
            "success": True,
            "extracted_data": cleaned_data,
            "raw_text": raw_text[:1000] + "..." if len(raw_text) > 1000 else raw_text,
            "method": "spacy_ner_with_regex"
        }
        
    except Exception as e:
        print(f"Processing error: {e}")
        return {
            "success": False,
            "error": str(e),
            "extracted_data": {}
        }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "spacy_available": nlp is not None,
        "easyocr_available": reader is not None,
        "model_path": MODEL_PATH,
        "model_exists": os.path.exists(MODEL_PATH)
    })

@app.route('/process', methods=['POST'])
def process_file():
    """Process uploaded file and extract data"""
    try:
        if 'file' not in request.files:
            return jsonify({
                "success": False,
                "error": "No file uploaded"
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No file selected"
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "File type not allowed. Please upload PNG, JPG, JPEG, or PDF files."
            }), 400
        
        # EasyOCR will be loaded when needed in extract_text_from_image
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Process the document
            result = process_document(file_path)
            return jsonify(result)
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("Starting AI Document Processing Service...")
    print(f"Faker pipeline path: {FAKER_PIPELINE_PATH}")
    print(f"Model path: {MODEL_PATH}")
    print(f"Model exists: {os.path.exists(MODEL_PATH)}")
    
    # Load only spaCy model at startup (EasyOCR loads on demand)
    if load_spacy_model():
        print("✓ spaCy model loaded successfully")
        print("Starting Flask server on http://localhost:5001")
        print("EasyOCR will be loaded when first document is processed")
        app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
    else:
        print("✗ Failed to load spaCy model. Exiting.")
        exit(1)
