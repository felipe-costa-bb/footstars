
import sys
import os
from rembg import remove
from PIL import Image

def process_image(input_path, output_path):
    try:
        if not os.path.exists(input_path):
            print(f"Error: Input file not found: {input_path}")
            return

        print(f"Processing: {input_path}")
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Saved to: {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {str(e)}")

if __name__ == "__main__":
    # Define images to process
    base_dir = "/Users/user/Code/footstars/client/public/assets/players"
    images = [
        ("bento_arsenal.png", "bento_arsenal.png"), # Overwrite? Maybe safer to create temp then move
        ("jakob_alnassr.png", "jakob_alnassr.png"),
        ("benjamin_manutd.png", "benjamin_manutd.png")
    ]

    for input_name, output_name in images:
        input_path = os.path.join(base_dir, input_name)
        # Create a temp output first
        temp_output_path = os.path.join(base_dir, "temp_" + output_name)
        
        process_image(input_path, temp_output_path)
        
        # If successful, replace original
        if os.path.exists(temp_output_path):
             os.replace(temp_output_path, os.path.join(base_dir, output_name))
             print(f"Updated {output_name}")

print("Batch processing complete.")
