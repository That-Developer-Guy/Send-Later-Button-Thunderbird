import os
import zipfile

def zip_directory(directory_path, zip_file_path):
    with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for foldername, subfolders, filenames in os.walk(directory_path):
            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                zip_file.write(file_path, os.path.relpath(file_path, directory_path))

def main():
    version = input("Type version: ")
    directory_name = f"version-{version}"
    
    parent_directory = os.path.dirname(os.getcwd())
    
    directory_path = os.path.join(parent_directory, directory_name)

    if not os.path.exists(directory_path):
        print(f"Error: The directory '{directory_path}' does not exist.")
        return

    zip_file_name = f"SendLaterButton-{version}.xpi"
    
    custom_zip_path = input(f"Enter the destination path for the zip file (leave empty for default '{parent_directory}'): ")
    if not custom_zip_path:
        custom_zip_path = parent_directory
    if os.path.exists(custom_zip_path + "\\" + zip_file_name):
        os.remove(custom_zip_path + "\\" + zip_file_name)
    
    zip_file_path = os.path.join(custom_zip_path, zip_file_name)

    zip_directory(directory_path, zip_file_path)

    print(f"The version '{version}' was created as '{zip_file_name}' at '{custom_zip_path}'.")

if __name__ == "__main__":
    main()