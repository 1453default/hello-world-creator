import re

def parse_dofy_variant_name(v_name, brand_slug):
    v_name = v_name.strip()
    
    # If brand is apple or there is no slash / no RAM mentioned:
    # Check for pattern like "8 GB/128 GB" or "8GB / 128GB" or "8GB/128GB" or "128 GB / 8 GB"
    # Note: On Dofy, "8 GB/128 GB" means RAM / Storage.
    if '/' in v_name:
        parts = [p.strip() for p in v_name.split('/')]
        if len(parts) == 2:
            p1, p2 = parts[0], parts[1]
            # determine which is RAM and which is Storage
            # Usually p1 is RAM (e.g. 4 GB, 6 GB, 8 GB, 12 GB, 16 GB) and p2 is storage (e.g. 64 GB, 128 GB, 256 GB, 512 GB, 1 TB)
            # Let's parse numbers and units
            m1 = re.search(r'(\d+)\s*(GB|TB|MB)', p1, re.I)
            m2 = re.search(r'(\d+)\s*(GB|TB|MB)', p2, re.I)
            if m1 and m2:
                val1, u1 = int(m1.group(1)), m1.group(2).upper()
                val2, u2 = int(m2.group(1)), m2.group(2).upper()
                
                # If u1 is TB, p1 is storage
                # If val2 > val1 and u1 == u2: p1 is RAM, p2 is storage
                # Standard Dofy format is RAM/Storage (e.g. 8 GB/128 GB)
                ram_str = f"{val1} {u1}"
                storage_str = f"{val2} {u2}"
                variant_display = f"{storage_str} / {ram_str} RAM"
                return variant_display, storage_str, ram_str
    
    # If no slash, e.g. "128 GB" or "1 TB"
    m = re.search(r'(\d+)\s*(GB|TB)', v_name, re.I)
    if m:
        storage_str = f"{m.group(1)} {m.group(2).upper()}"
        return storage_str, storage_str, "—"
    
    # Fallback
    return v_name, v_name, "—"

# Test examples
test_cases = [
    ("128 GB", "apple"),
    ("256 GB", "apple"),
    ("1 TB", "apple"),
    ("8 GB/128 GB", "samsung"),
    ("12 GB/256 GB", "samsung"),
    ("16 GB/512 GB", "oneplus"),
    ("4 GB/64 GB", "vivo"),
    ("8GB / 128GB", "xiaomi"),
]

for tc, b in test_cases:
    v_disp, st, ram = parse_dofy_variant_name(tc, b)
    print(f"{tc:15} -> Variant: '{v_disp}', Storage: '{st}', RAM: '{ram}'")
