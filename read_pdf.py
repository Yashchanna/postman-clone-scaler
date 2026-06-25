import fitz  # PyMuPDF
doc = fitz.open(r"e:\Scaler Project\Scaler assignment.pdf")
print(f"Total pages: {doc.page_count}")
for i, page in enumerate(doc):
    # Render page to image
    pix = page.get_pixmap(dpi=200)
    output_path = f"e:\\Scaler Project\\page_{i+1}.png"
    pix.save(output_path)
    print(f"Saved page {i+1} to {output_path}")
    
    # Also try to get any text
    text = page.get_text()
    if text.strip():
        print(f"Text on page {i+1}: {text}")
    else:
        print(f"Page {i+1}: No extractable text (image-based)")
    
    # Check for images
    images = page.get_images()
    print(f"Page {i+1} has {len(images)} embedded images")
    
doc.close()
