import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

build_id = 'uQvNXRaRclkFWZB1XAQdK'
urls = [
    f'https://www.dofy.in/_next/data/{build_id}/in-en/india/sell-old-phone.json',
    f'https://www.dofy.in/_next/data/{build_id}/in-en/india/sell-old-device.json'
]

for url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f'SUCCESS: {url}')
            data = json.loads(resp.read().decode('utf-8'))
            pageProps = data.get('pageProps', {})
            print('pageProps keys:', list(pageProps.keys()))
            for k in pageProps:
                if isinstance(pageProps[k], list):
                    print(f'  {k} (list of {len(pageProps[k])}):')
                    if len(pageProps[k]) > 0:
                        print('    first item:', pageProps[k][0])
            with open(f'scripts/{url.split("/")[-1]}', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
    except Exception as e:
        print(f'Failed {url}: {e}')
