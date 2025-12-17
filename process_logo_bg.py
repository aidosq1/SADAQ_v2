from PIL import Image

def add_background_color(input_path, output_path, color_hex):
    img = Image.open(input_path).convert("RGBA")
    
    # Create solid background image
    bg_color = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4)) + (255,)
    background = Image.new("RGBA", img.size, bg_color)
    
    # Composite
    combined = Image.alpha_composite(background, img)
    
    combined.save(output_path, "PNG")
    print(f"Saved logo with background {color_hex} to {output_path}")

if __name__ == "__main__":
    # Using the previously processed transparent logo
    add_background_color("public/logo_federation_new.png", "public/logo_federation_colored.png", "#7B1B1B")
