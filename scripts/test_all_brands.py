import glob
import json
import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

build_id = 'uQvNXRaRclkFWZB1XAQdK'

brand_files = sorted(glob.glob('dofy_cache/brands/*.json'))
print(f'Testing 1 model from each of {len(brand_files)} brands...')

for bf in brand_files:
    brand_slug = bf.replace('\\', '/').split('/')[-1].replace('.json', '')
    models = json.load(open(bf, encoding='utf-8'))
    if not models:
        print(f'No models for {brand_slug}')
        continue
    # Pick a model
    m = models[0]
    enum_name = m['EnumName']
    model_slug = enum_name.replace('_', '-').replace(' ', '-').lower()
    url = f'https://www.dofy.in/_next/data/{build_id}/in-en/india/sell-old-phone/{brand_slug}/{model_slug}.json'
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            vars = data.get('pageProps', {}).get('selectVariant', [])
            v_desc = f"{len(vars)} variants"
            if vars:
                v_desc += f" (e.g. {vars[0].get('Name')}: {vars[0].get('MaximumValue')})"
            print(f"OK   [{brand_slug:15}] {m['Name']:30} -> {v_desc}")
    except urllib.error.HTTPError as e:
        print(f"HTTP [{brand_slug:15}] {m['Name']:30} -> {e.code} ({url})")
    except Exception as e:
        print(f"ERR  [{brand_slug:15}] {m['Name']:30} -> {e}")
