
import os
from PIL import Image

def remove_green_screen(input_path, output_path, tolerance=60):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Green screen color is usually pure green (0, 255, 0)
            # But the model might vary.
            # We assume "Green" dominant pixel.
            # Logic: G > R + tol AND G > B + tol OR close to pure green
            
            r, g, b, a = item
            
            # Simple green detection: if Green is significantly higher than Red and Blue
            # Adjust heuristics as needed. Replaced pixels become transparent.
            
            if g > 150 and r < 120 and b < 120:
                newData.append((0, 0, 0, 0)) # Transparent
            elif g > (r + b) * 0.9 and g > 100:
                 newData.append((0, 0, 0, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Processed {input_path} -> {output_path}")

    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    base_dir = "/Users/user/.gemini/antigravity/brain/12e9d4e5-a06f-4386-b2d2-bcdcb9cf1439"
    target_dir = "/Users/user/Code/footstars/client/public/assets/players"
    
    # Map input (in artifact dir) to output (in assets dir)
    files = [
        ("bento_arsenal_green_1771172999666.png", "bento_arsenal.png"),
        ("jakob_alnassr_green_1771173013665.png", "jakob_alnassr.png"),
        ("benjamin_manutd_green_1771173027281.png", "benjamin_manutd.png")
    ]
    
    for input_file, output_file in files:
        input_path = os.path.join(base_dir, input_file)
        output_path = os.path.join(target_dir, output_file)
        
        if os.path.exists(input_path):
            remove_green_screen(input_path, output_path)
        else:
            print(f"Input file not found: {input_path}")
