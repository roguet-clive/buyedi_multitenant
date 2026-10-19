import os
import zipfile

PROJECT_DIR = r"c:\laragon\www\buyedi_sagesse_divine"
OUTPUT_ZIP = os.path.join(PROJECT_DIR, "update_buyedi.zip")

# Directories to include completely
DIRS_TO_INCLUDE = [
    "app",
    "config",
    "database",
    "resources",
    "routes",
]

# Specific files or subpaths to include
SPECIFIC_ITEMS = [
    ("bootstrap/app.php", "bootstrap/app.php"),
    ("public/build", "public/build"),
    ("public/images", "public/images"),
    ("public/index.php", "public/index.php"),
    ("public/.htaccess", "public/.htaccess"),
    (".htaccess", ".htaccess"),
    ("composer.json", "composer.json"),
]

if os.path.exists("bootstrap/providers.php"):
    SPECIFIC_ITEMS.append(("bootstrap/providers.php", "bootstrap/providers.php"))

def build_zip():
    if os.path.exists(OUTPUT_ZIP):
        os.remove(OUTPUT_ZIP)

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        # Add whole directories
        for d in DIRS_TO_INCLUDE:
            abs_d = os.path.join(PROJECT_DIR, d)
            for root, dirs, files in os.walk(abs_d):
                for f in files:
                    abs_path = os.path.join(root, f)
                    rel_path = os.path.relpath(abs_path, PROJECT_DIR).replace("\\", "/")
                    zipf.write(abs_path, rel_path)

        # Add specific items
        for src, dest in SPECIFIC_ITEMS:
            abs_src = os.path.join(PROJECT_DIR, src.replace("/", os.sep))
            if os.path.isdir(abs_src):
                for root, dirs, files in os.walk(abs_src):
                    for f in files:
                        abs_path = os.path.join(root, f)
                        rel_path = os.path.relpath(abs_path, PROJECT_DIR).replace("\\", "/")
                        zipf.write(abs_path, rel_path)
            elif os.path.isfile(abs_src):
                zipf.write(abs_src, dest.replace("\\", "/"))

    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"SUCCESS: {OUTPUT_ZIP} created ({size_mb:.2f} MB) with standard Linux forward-slashes.")

if __name__ == "__main__":
    build_zip()
