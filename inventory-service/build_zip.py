import os
import zipfile

def create_zip(zip_name, source_dir):
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            if '__pycache__' in root or 'verification' in root:
                continue
            for file in files:
                if file in ['inventory_service.zip', 'build_zip.py', 'README.md']:
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    create_zip('inventory_service.zip', '.')
