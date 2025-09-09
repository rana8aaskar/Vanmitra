from PIL import Image, ImageDraw, ImageFont
from faker import Faker
import random
import os

# Initialize Faker
fake = Faker()

# Create output folder
folder = "output"
os.makedirs(folder, exist_ok=True)

# Create a blank white image
width, height = 1000, 1800
image = Image.new("RGB", (width, height), "white")
draw = ImageDraw.Draw(image)

# Load fonts (with fallbacks)
try:
    font_header = ImageFont.truetype("arialbd.ttf", 28)  # bold for main title
    font_subheader = ImageFont.truetype("ariali.ttf", 18)  # italic for subtitle
    font_section = ImageFont.truetype("arialbd.ttf", 22)  # bold for section titles
    font_label = ImageFont.truetype("arial.ttf", 18)      # normal for labels
except:
    font_header = ImageFont.load_default()
    font_subheader = ImageFont.load_default()
    font_section = ImageFont.load_default()
    font_label = ImageFont.load_default()

# Helper function to generate random Yes/No
rand_yes_no = lambda: random.choice(["Yes", "No"])

# Starting position
y = 40
x = 60

# Title
header_text = "FRA CLAIM FORM – 2006"
draw.text((x, y), header_text, font=font_header, fill="black")
y += 40

# Subtitle
subheader_text = "(For Individual / Community / Community Forest Resource Rights)"
draw.text((x, y), subheader_text, font=font_subheader, fill="black")
y += 50

sections = {
    "1. Claimant Details": [
        ("Name of Claimant:", fake.name()),
        ("Father’s / Husband’s Name:", fake.name_male()),
        ("Age / Gender / Aadhaar No:", f"{random.randint(18,80)} / {random.choice(['Male','Female'])} / {fake.random_number(digits=12)}"),
        ("Category:", random.choice(['ST','OTFD']))
    ],
    "2. Village & Administrative Details": [
        ("Village:", fake.city_suffix()),
        ("Gram Panchayat:", fake.city()),
        ("Block / Tehsil:", fake.street_name()),
        ("District:", fake.city()),
        ("State:", fake.state())
    ],
    "3. Land Claim Details": [
        ("Claim Type:", random.choice(['IFR','CR','CFR'])),
        ("Area of Land Claimed:", f"{random.randint(1,20)} hectares / acres"),
        ("Land Use:", random.choice(['Agriculture','Homestead','Mixed'])),
        ("Boundary Description:", fake.street_address()),
        ("Geo-Coordinates (Lat, Long):", f"{round(random.uniform(-90,90),4)}, {round(random.uniform(-180,180),4)}")
    ],
    "4. Verification & Status": [
        ("Verified by Gram Sabha?", rand_yes_no()),
        ("Status of Claim:", random.choice(['Pending','Approved','Rejected'])),
        ("Date of Submission:", fake.date_this_decade().strftime('%d/%m/%Y')),
        ("Date of Decision:", fake.date_this_decade().strftime('%d/%m/%Y')),
        ("Patta / Title No.:", fake.bothify(text='??#####'))
    ],
    "5. Assets": [
        ("Nearby Water Body:", random.choice(['Pond','Stream','River'])),
        ("Irrigation Source:", random.choice(['Well','Canal','Borewell'])),
        ("Infrastructure Present:", random.choice(['Road','Borewell','School','Health Center'])),
        ("PM-KISAN:", rand_yes_no()),
        ("MGNREGA:", rand_yes_no()),
        ("Jal Jeevan Mission:", rand_yes_no()),
        ("DAJGUA Benefit:", rand_yes_no())
    ],
    "6. Signatures": [
        ("Claimant Signature / Thumb:", fake.first_name()),
        ("Gram Sabha Chairperson:", fake.name()),
        ("Forest Dept. Officer:", fake.name()),
        ("Revenue Dept. Officer:", fake.name())
    ]
}

# Draw sections with improved formatting
for section, fields in sections.items():
    draw.text((x, y), section, font=font_section, fill="black")
    y += 40
    for label, value in fields:
        draw.text((x+40, y), f"{label}", font=font_label, fill="black")
        bbox = draw.textbbox((x+40, y), label, font=font_label)
        label_w = bbox[2] - bbox[0]
        label_h = bbox[3] - bbox[1]
        # Draw underline after label clearly below the text
        line_x_start = x + 40 + label_w + 10
        line_x_end = line_x_start + 300
        line_y = y + label_h + 10  # further lowered underline
        draw.line((line_x_start, line_y, line_x_end, line_y), fill="black", width=1)
        # Draw value text above the underline
        draw.text((line_x_start+5, y), value, font=font_label, fill="black")
        y += 35
    y += 25

# Save image
output_path = os.path.join(folder, "output.png")
image.save(output_path)
print(f"Form PNG saved at {output_path}")
