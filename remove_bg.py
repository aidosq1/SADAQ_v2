from PIL import Image

def remove_white_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Change all white (also shades of whites)
        # to transparent
        r, g, b = item[0], item[1], item[2]
        # Remove white and light gray (checkerboard pattern)
        # Checkerboard grays are often around 200-240.
        # Also ensure it's grayscale-ish (r~=g~=b) to avoid deleting actual logo colors if possible,
        # though gold/brown is distinct from neutral grays.
        is_light = r > 190 and g > 190 and b > 190
        is_neutral = abs(r - g) < 20 and abs(r - b) < 20 and abs(g - b) < 20
        
        if is_light and is_neutral:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    
    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    remove_white_background("/Users/aidosq/.gemini/antigravity/brain/245addc3-38a5-4b3f-987b-501aacbed646/uploaded_image_1766011863081.png", "public/logo_federation_circular.png")
