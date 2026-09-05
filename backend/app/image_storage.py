import base64
import os
import uuid
import subprocess

# Primary uploads directory is backend/uploads (served by FastAPI app.mount("/uploads"))
BACKEND_UPLOADS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "uploads")
)
os.makedirs(BACKEND_UPLOADS_DIR, exist_ok=True)

# Secondary uploads directory for local Vite development if public folder exists
PUBLIC_UPLOADS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "uploads")
)
if os.path.exists(os.path.dirname(PUBLIC_UPLOADS_DIR)):
    os.makedirs(PUBLIC_UPLOADS_DIR, exist_ok=True)

# Maximum image upload size: 10 MB in characters (~7.5 MB raw image)
MAX_BASE64_LENGTH = 10 * 1024 * 1024

def save_image_and_push_to_github(image_data: str) -> str:
    """
    Saves a base64 image data string into uploads/ storage safely and without blocking the API thread.
    Returns the relative URL path (/uploads/filename.ext).
    """
    if not image_data or not isinstance(image_data, str):
        return image_data

    # If it's already a URL or path, no base64 conversion needed
    if not image_data.startswith("data:image/"):
        return image_data

    # Guard against oversized payloads (DoS protection)
    if len(image_data) > MAX_BASE64_LENGTH:
        print(f"Warning: Image payload exceeds maximum size limit ({len(image_data)} > {MAX_BASE64_LENGTH})")
        return image_data

    try:
        header, encoded = image_data.split(",", 1)
        ext = "jpg"
        if "png" in header.lower():
            ext = "png"
        elif "webp" in header.lower():
            ext = "webp"
        elif "svg" in header.lower():
            ext = "svg"

        filename = f"upload_{uuid.uuid4().hex[:12]}.{ext}"
        primary_filepath = os.path.join(BACKEND_UPLOADS_DIR, filename)

        raw_bytes = base64.b64decode(encoded)
        with open(primary_filepath, "wb") as f:
            f.write(raw_bytes)

        # Mirror to public/uploads if available (for local dev server parity)
        if os.path.exists(PUBLIC_UPLOADS_DIR):
            try:
                public_filepath = os.path.join(PUBLIC_UPLOADS_DIR, filename)
                with open(public_filepath, "wb") as f:
                    f.write(raw_bytes)
            except Exception as mirror_err:
                print(f"Public uploads mirror notice: {mirror_err}")

        rel_path = f"/uploads/{filename}"
        print(f"Successfully stored uploaded photo: {rel_path}")
        return rel_path
    except Exception as err:
        print(f"Error saving image: {err}")
        return image_data
