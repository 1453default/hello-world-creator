import urllib.request
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')
build_id = 'uQvNXRaRclkFWZB1XAQdK'

def fetch_model(brand_slug, enum_name):
    model_slug = enum_name.replace('_', '-').replace(' ', '-').lower()
    url = f'https://www.dofy.in/_next/data/{build_id}/in-en/india/sell-old-phone/{brand_slug}/{model_slug}.json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return True, brand_slug, model_slug, data
    except urllib.error.HTTPError as e:
        return False, brand_slug, model_slug, f"HTTP {e.code}"
    except Exception as e:
        return False, brand_slug, model_slug, str(e)

# Test Apple (38) + Nothing (11) = 49 models
tasks = []
for bslug in ['apple', 'nothing']:
    models = json.load(open(f'dofy_cache/brands/{bslug}.json', encoding='utf-8'))
    for m in models:
        tasks.append((bslug, m['EnumName'], m['Name']))

print(f"Fetching {len(tasks)} models using ThreadPoolExecutor...")
success_count = 0
fail_count = 0

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(fetch_model, bslug, ename): (bslug, ename, mname) for bslug, ename, mname in tasks}
    for fut in as_completed(futures):
        bslug, ename, mname = futures[fut]
        ok, _, _, res = fut.result()
        if ok:
            variants = res.get('pageProps', {}).get('selectVariant', [])
            success_count += 1
            print(f"  OK: {mname:30} -> {len(variants)} variants")
        else:
            fail_count += 1
            print(f"  FAIL: {mname:30} -> {res}")

print(f"Done! Success: {success_count}, Fail: {fail_count}")
