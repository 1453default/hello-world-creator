import urllib.request
import json
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Let's test a few candidate URLs for iPhone 14 or iPhone 13 or iPhone 15 or iPhone 17 Pro
test_slugs = [
    'apple-iphone-15',
    'apple-iphone-15-pro',
    'apple-iphone-14',
    'apple-iphone-13',
    'iphone-15',
    'apple-iphone-17-pro',
    'Apple_iPhone_15',
    'Apple_iPhone_17_Pro'
]

for slug in test_slugs:
    url = f'https://www.dofy.in/in-en/india/sell-old-phone/apple/{slug}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f'SUCCESS [{resp.status}]: {url}')
            content = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', content)
            if m:
                data = json.loads(m.group(1))
                print('  pageProps keys:', list(data.get('props', {}).get('pageProps', {}).keys()))
                with open(f'scripts/model_sample_{slug}.json', 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)
                print(f'  Saved props to scripts/model_sample_{slug}.json')
                break
    except urllib.error.HTTPError as e:
        print(f'HTTP {e.code}: {url}')
    except Exception as e:
        print(f'Error {e}: {url}')
