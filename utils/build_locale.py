import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import zipfile
import re
import json
import shutil

LANGPACK_LIST_URL = "https://services.addons.thunderbird.net/en-US/thunderbird/language-tools/"

def fetch_langpacks():
    resp = requests.get(LANGPACK_LIST_URL)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    language_code_files = {}

    langs = []

    for tr in soup.select("tbody tr"):
        lang_cell = tr.select_one("td[lang]")
        if not lang_cell:
            continue
        code = lang_cell.get("lang").strip()

        langpack_link = tr.select_one('a[href*="tb-langpack-"]')
        langpack_url = (
            "https://addons.thunderbird.net" + langpack_link["href"]
            if langpack_link
            else None
        )

        langs.append({
            "code": code,
            "langpack": langpack_url
        })

    locales = list(dict.fromkeys([l['code'] for l in langs if l["langpack"]]))

    for locale in locales:
        LANGPACK_SPECIFIC_URL = f"https://services.addons.thunderbird.net/en-US/thunderbird/addon/tb-langpack-{locale}"
        resp = requests.get(LANGPACK_SPECIFIC_URL)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        local_download_link = soup.find(class_="button download prominent")["href"]

        if local_download_link.startswith("/"):
            local_download_link = "https://addons.thunderbird.net" + local_download_link

        cache_dir = "cache"
        os.makedirs(cache_dir, exist_ok=True)

        parsed_url = urlparse(local_download_link)
        filename = os.path.basename(parsed_url.path)

        file_path = os.path.join(cache_dir, filename)

        response = requests.get(local_download_link, stream=True)
        response.raise_for_status()

        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        language_code_files[locale] = filename

    return language_code_files

def parse_packs(packs):
    entity_map = {
        "sendlaterButton.tooltip": "title",
        "sendLaterCmd.label": "label"
    }

    results = {}

    for locale, xpi_file in packs.items():
        file_path = os.path.join("cache", xpi_file)
        if not os.path.exists(file_path):
            print(f"[{locale}] File not found: {xpi_file}")
            continue

        results[locale] = {}

        # Handle the edge case of et-EE
        if locale == "et-EE":
            results[locale] = results["et"]
            continue

        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            dtd_path = f"chrome/{locale}/locale/{locale}/messenger/messengercompose/messengercompose.dtd"
            try:
                with zip_ref.open(dtd_path) as dtd_file:
                    content = dtd_file.read().decode("utf-8")

                    for entity_name, key in entity_map.items():
                        pattern = fr'<!ENTITY\s+{re.escape(entity_name)}\s+"(.*?)">'
                        match = re.search(pattern, content)
                        if match:
                            results[locale][key] = match.group(1)
                        else:
                            results[locale][key] = None
            except KeyError:
                print(f"[{locale}] DTD file not found in XPI: {dtd_path}")
                for key in entity_map.values():
                    results[locale][key] = None

    shutil.rmtree("cache")

    return results

if __name__ == "__main__":
    packs = fetch_langpacks()
    parsed_packs = parse_packs(packs)

    output_path = "locale_composeAction.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed_packs, f, ensure_ascii=False, indent=4)