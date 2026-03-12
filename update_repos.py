import requests
import json
import os
import base64

TOKEN = os.getenv('MY_GITHUB_TOKEN')
headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/vnd.github+json'
}

# Ambil semua repo (Public & Private)
# Untuk Fine-grained PAT, endpoint /user/repos tetap berfungsi selama scope diberikan
response = requests.get('https://api.github.com/user/repos?per_page=100&type=all', headers=headers)

if response.status_code != 200:
    print(f"Error fetching repos: {response.status_code}")
    print(response.text)
    exit(1)

repos = response.json()
showcase_data = []

for repo in repos:
    name = repo['name']
    is_private = repo['private']
    
    # Ambil snippet README jika repo bukan fork (opsional) atau butuh detail lebih
    # Default ke description repo
    snippet = repo.get('description') or ""
    
    try:
        readme_req = requests.get(f'https://api.github.com/repos/{repo["owner"]["login"]}/{name}/readme', headers=headers)
        if readme_req.status_code == 200:
            content_b64 = readme_req.json().get('content', '')
            if content_b64:
                decoded = base64.b64decode(content_b64).decode('utf-8', errors='ignore')
                # Ambil 150 karakter pertama README sebagai snippet jika deskripsi kosong
                if not snippet:
                    snippet = decoded[:150].replace('\n', ' ').strip() + "..."
    except Exception as e:
        print(f"Warning: Could not fetch README for {name}: {e}")

    showcase_data.append({
        "name": name,
        "private": is_private,
        "description": snippet or "Internal strategic module.",
        "language": repo.get('language') or "Binary"
    })

# Simpan ke file JSON buat dibaca Website
with open('repos_data.json', 'w') as f:
    json.dump(showcase_data, f, indent=4)