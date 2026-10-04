import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

url = 'https://www.dofy.in/_next/data/uQvNXRaRclkFWZB1XAQdK/in-en/india/sell-old-phone/apple/apple-iphone-15.json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('Status:', resp.status)
        data = json.loads(resp.read().decode('utf-8'))
        print('Variants for iPhone 15:')
        for v in data['pageProps']['selectVariant']:
            print(f"  {v['Name']}: {v['MaximumValue']}")
except Exception as e:
    print('Error:', e)
