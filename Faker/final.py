from faker import Faker
from PIL import Image, ImageDraw, ImageFont
import random
import os
import cv2
import numpy as np

# --- Configuration ---
output_dir = "fra_generated_forms"
os.makedirs(output_dir, exist_ok=True)

# Path to your blank form image. I will assume it's in the same directory.
form_template_path = "fra_blank.png"
output_file_path = os.path.join(output_dir, "filled_and_scanned_form.png")

# --- Function to help find coordinates ---
# Run this once and carefully note the (x, y) coordinates
# def find_coordinates(image_path):
#     img = cv2.imread(image_path)
#     coords = []
#     def click_event(event, x, y, flags, param):
#         if event == cv2.EVENT_LBUTTONDOWN:
#             print(f"Clicked at: ({x}, {y})")
#             coords.append((x, y))
#             cv2.circle(img, (x, y), 5, (0, 0, 255), -1)
#             cv2.imshow("Coordinate Finder", img)
#     cv2.imshow("Coordinate Finder", img)
#     cv2.setMouseCallback("Coordinate Finder", click_event)
#     cv2.waitKey(0)
#     cv2.destroyAllWindows()
#     print("Collected coordinates:", coords)

# Uncomment the line below, run the script, and click on your form to get the coordinates.
# find_coordinates(form_template_path)

# --- Define the coordinates for the 'Name of the claimant (s):' field ---
# Based on the template you provided, this is a good starting point.
# You will need to adjust this with the exact coordinates you find.
CLAIMANT_NAME_COORDS = (250, 116)

# --- Script to generate and process a single form ---
def generate_single_form(template_path, output_path):
    """Generates a single synthetic form with distortions."""
    
    # --- Part 1: Fill the form with data (Pillow) ---
    try:
        # Using a default font, but you can specify a path to a .ttf file for better style matching.
        font = ImageFont.truetype("arial.ttf", 16)
    except IOError:
        font = ImageFont.load_default()

    img = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(img)

    # Generate a single piece of fake data
    faker = Faker("en_IN")
    claimant_name = faker.name()

    # Draw the text onto the image at the specified coordinates
    draw.text(CLAIMANT_NAME_COORDS, claimant_name, font=font, fill="black")

    # --- Part 2: Add distortions (OpenCV) ---
    # Convert the PIL Image to an OpenCV image for processing
    opencv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # Apply a random rotation (skew)
    angle = random.uniform(-1.5, 1.5)
    (h, w) = opencv_img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    opencv_img = cv2.warpAffine(opencv_img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Apply a Gaussian blur for noise
    opencv_img = cv2.GaussianBlur(opencv_img, (3, 3), 0)

    # Convert to grayscale and save
    gray_img = cv2.cvtColor(opencv_img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(output_path, gray_img)

    print(f"🎉 Form generated successfully at: {output_file_path}")

# --- Run the main function ---
if __name__ == '__main__':
    generate_single_form(form_template_path, output_file_path)