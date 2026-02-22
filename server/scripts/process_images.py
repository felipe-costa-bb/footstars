
import os
from PIL import Image

def process_image(input_path, output_path):
    try:
        print(f"Processing {input_path}...")
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        # 1. Green Screen Removal
        newData = []
        for item in datas:
            r, g, b, a = item
            # Heuristic for green screen removal
            # If Green is significantly dominant
            if g > 100 and g > (r + b) * 0.8:
                newData.append((0, 0, 0, 0)) # Transparent
            else:
                newData.append(item)
        
        img.putdata(newData)
        
        # 2. Crop / "Remove Shoulders"
        # Get styling: finding the bounding box of non-transparent pixels
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
            # User wants "remove a little bit of the shoulders"
            # This likely means cropping from the bottom up to show less torso.
            # Let's crop the bottom 10% of the height to reduce shoulder visibility/torso.
            width, height = img.size
            new_height = int(height * 0.9)
            img = img.crop((0, 0, width, new_height))
            
            # Optional: Resize to standard size if needed, but keeping resolution is fine.
            # FIFA cards often have a nice fade at bottom, but clean cut is safer.
        
        img.save(output_path, "PNG")
        print(f"Saved to {output_path}")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    base_dir = "/Users/user/.gemini/antigravity/brain/12e9d4e5-a06f-4386-b2d2-bcdcb9cf1439"
    target_dir = "/Users/user/Code/footstars/client/public/assets/players"
    
    files = [
        ("bento_arsenal_green_1771172999666.png", "bento_arsenal.png"),
        ("jakob_alnassr_green_1771173013665.png", "jakob_alnassr.png"),
        ("benjamin_manutd_green_1771173027281.png", "benjamin_manutd.png")
    ]
    
    for input_file, output_file in files:
        input_path = os.path.join(base_dir, input_file)
        # target full path
        output_path = os.path.join(target_dir, output_file)
        
        if os.path.exists(input_path):
            process_image(input_path, output_path)
        else:
            print(f"Input not found: {input_path}")
