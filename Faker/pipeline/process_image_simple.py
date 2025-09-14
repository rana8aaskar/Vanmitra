import sys
import json
import easyocr
import os
import re
from pathlib import Path

# Initialize EasyOCR reader
try:
    reader = easyocr.Reader(['en'])
except Exception as e:
    print(json.dumps({"error": f"Failed to load EasyOCR: {str(e)}"}))
    sys.exit(1)

def extract_text_from_image(image_path):
    """Extract text from image using EasyOCR"""
    try:
        result = reader.readtext(image_path, detail=0)
        return "\n".join(result)
    except Exception as e:
        return None

def extract_fields_from_text(text):
    """Extract fields using regex patterns"""
    if not text:
        return {}

    data = {}

    # Common patterns for FRA forms
    patterns = {
        'name': r"(?:Name|Claimant|नाम)[:\s]*([A-Za-z\s]+?)(?:\n|$|Father|Husband)",
        'father_husband_name': r"(?:Father|Husband|पिता|पति)[:\s]*(?:Name|नाम)?[:\s]*([A-Za-z\s]+?)(?:\n|$)",
        'village': r"(?:Village|गांव|ग्राम)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'panchayat': r"(?:Panchayat|पंचायत|Gram\s*Panchayat)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'tehsil': r"(?:Tehsil|Block|तहसील|ब्लॉक)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'district': r"(?:District|जिला)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'state': r"(?:State|राज्य)[:\s]*([A-Za-z\s]+?)(?:\n|$|,)",
        'area_of_land': r"(?:Area|Land\s*Area|क्षेत्र)[:\s]*([0-9.]+\s*(?:hectare|acre|हेक्टेयर|एकड़)?)",
        'khasra_number': r"(?:Khasra|Patta|खसरा|पट्टा)[:\s]*(?:No|Number|संख्या)?[:\s]*([A-Za-z0-9/\-]+)",
    }

    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            data[field] = match.group(1).strip()

    # Try to extract boundaries
    boundary_pattern = r"(?:North|South|East|West|उत्तर|दक्षिण|पूर्व|पश्चिम)[:\s]*([A-Za-z\s,]+?)(?:\n|$)"
    boundaries = re.findall(boundary_pattern, text, re.IGNORECASE | re.MULTILINE)

    if boundaries:
        if len(boundaries) > 0:
            data['boundary_north'] = boundaries[0].strip() if boundaries else ''
        if len(boundaries) > 1:
            data['boundary_south'] = boundaries[1].strip()
        if len(boundaries) > 2:
            data['boundary_east'] = boundaries[2].strip()
        if len(boundaries) > 3:
            data['boundary_west'] = boundaries[3].strip()

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

        # Extract fields
        extracted_data = extract_fields_from_text(text)

        return {
            "success": True,
            "extracted_data": extracted_data,
            "raw_text": text[:500],  # First 500 chars for debugging
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