import os

# Packages to exclude (Windows-specific or platform-dependent that fail on Linux)
EXCLUDE_LIST = [
    'pywin32', 'pywinpty', 'pyreadline3', 'colorama', 
    'debugpy', 'pygame', 'terminado', 'watchdog',
    'python-dateutil', # often causes issues if pinned wrong
]

with open('frozen_reqs_ascii.txt', 'r') as f:
    lines = f.readlines()

filtered_lines = []
for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Check exclude list
    pkg_name = line.split('==')[0].lower()
    if pkg_name in EXCLUDE_LIST:
        continue
    
    # Generic filters
    if any(x in line.lower() for x in ['window', 'win32', 'win-amd64']):
        continue
        
    filtered_lines.append(line)

# Add production server
if 'gunicorn' not in [l.split('==')[0].lower() for l in filtered_lines]:
    filtered_lines.append('gunicorn==23.0.0')

# Force CPU torch index in the requirements
final_reqs = [
    "--index-url https://pypi.org/simple",
    "--extra-index-url https://download.pytorch.org/whl/cpu",
] + filtered_lines

with open('requirements_api_frozen.txt', 'w') as f:
    f.write('\n'.join(final_reqs) + '\n')

print(f"Filtered {len(filtered_lines)} packages into requirements_api_frozen.txt")
