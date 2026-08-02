import base64
import os
import uuid
import subprocess

UPLOADS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "uploads")
)
os.makedirs(UPLOADS_DIR, exist_ok=True)

def save_image_and_push_to_github(image_data: str) -> str:
    """
    Saves a base64 image data string into public/uploads/, commits it to Git,
    and pushes to GitHub for persistent image storage.
    Returns the relative URL path (/uploads/filename.ext).
    """
    if not image_data or not isinstance(image_data, str):
        return image_data

    # If it's already a URL or path, no base64 conversion needed
    if not image_data.startswith("data:image/"):
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
        filepath = os.path.join(UPLOADS_DIR, filename)

        raw_bytes = base64.b64decode(encoded)
        with open(filepath, "wb") as f:
            f.write(raw_bytes)

        rel_path = f"/uploads/{filename}"
        print(f"Successfully saved uploaded image to disk: {filepath}")

        # Git commit and push uploaded picture to GitHub
        _git_push_uploaded_file(filepath)

        return rel_path
    except Exception as err:
        print(f"Error saving image: {err}")
        return image_data

def _git_push_uploaded_file(filepath: str):
    """
    Adds, commits, and pushes the uploaded picture to GitHub repo.
    """
    try:
        repo_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        filename = os.path.basename(filepath)
        rel_git_path = os.path.join("public", "uploads", filename)

        subprocess.run(["git", "add", rel_git_path], cwd=repo_dir, capture_output=True, text=True, check=False)
        subprocess.run(
            ["git", "commit", "-m", f"Store user uploaded photo: {filename}"],
            cwd=repo_dir,
            capture_output=True,
            text=True,
            check=False
        )
        # Push to GitHub
        result = subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=repo_dir,
            capture_output=True,
            text=True,
            check=False
        )
        if result.returncode == 0:
            print(f"Successfully pushed uploaded photo {filename} to GitHub!")
        else:
            print(f"Git push notice: {result.stderr}")
    except Exception as e:
        print(f"Failed to push picture to GitHub: {e}")
