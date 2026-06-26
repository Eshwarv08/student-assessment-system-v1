import pytesseract
from PIL import Image
import sys
import glob
import os

images = glob.glob('/home/ganapathi/.gemini/antigravity/brain/a17c93b4-1892-4dcd-8125-9c9f26483585/media__*.png')
images.sort(key=os.path.getmtime)

for img in images[-5:]:
    print(f"--- Text from {os.path.basename(img)} ---")
    text = pytesseract.image_to_string(Image.open(img))
    print(text[:200])
    print("...")
