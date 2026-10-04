import urllib.request
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

build_id = 'uQvNXRaRclkFWZB1XAQdK'

def test_model(brand_slug, model_slug):
    url = f'https://www.dofy.in/_next/data/{build_id}/in-en/india/sell-old-phone/{brand_slug}/{model_slug}.json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            variants = data.get('pageProps', {}).get('selectVariant', [])
            print(f'SUCCESS [200]: {brand_slug}/{model_slug} -> {len(variants)} variants')
            for v in variants[:3]:
                print(f"   {v.get('Name')}: {v.get('MaximumValue')}")
            return True, variants
    except urllib.error.HTTPError as e:
        print(f'HTTP {e.code}: {brand_slug}/{model_slug}')
        return False, None
    except Exception as e:
        print(f'ERROR: {brand_slug}/{model_slug} -> {e}')
        return False, None

# Test some known models
test_model('apple', 'apple-iphone-14')
test_model('apple', 'apple-iphone-17-pro')
test_model('apple', 'apple-iphone-18-pro-max')
test_model('samsung', 'samsung-galaxy-s23')
test_model('google-pixel', 'google-pixel-8a')
test_model('oneplus', 'oneplus-12')
