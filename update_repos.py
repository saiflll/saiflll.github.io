import requests
import json
import os

# Ambil token dari env
TOKEN = os.getenv('MY_GITHUB_TOKEN')

# Header khusus GitHub API
headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
}

def fetch_repos():
    # Ganti ke endpoint users/saiflll/repos
    url = 'https://api.github.com/users/saiflll/repos?per_page=100'
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Fetching from: {url} | Status: {response.status_code}")
        
        response.raise_for_status()
        repos = response.json()
        
        if not isinstance(repos, list):
            print(f"Error: Expected list, got {type(repos)}")
            return []

        showcase_data = []
        for repo in repos:
            # Tetap filter saiflll.github.io
            if repo['name'].lower() == "saiflll.github.io":
                continue
                
            showcase_data.append({
                "name": repo['name'],
                "is_private": repo.get('private', False),
                "description": repo.get('description') or "Active Engineering Project",
                "tech_stack": repo.get('language') or "Mixed Tech",
                "last_update": repo.get('updated_at')[:10]
            })
            
        return showcase_data
    except Exception as e:
        print(f"Logic Error: {e}")
        return []
if __name__ == "__main__":
    data = fetch_repos()
    
    # Hanya simpan jika data tidak kosong agar tidak menimpa file dengan [] jika error
    if data:
        with open('repos_data.json', 'w') as f:
            json.dump(data, f, indent=4)
        print(f"Selesai! {len(data)} repo berhasil di-mapping ke repos_data.json")
    else:
        print("PERINGATAN: Data kosong atau error. repos_data.json tidak diperbarui untuk mencegah tampilan blank.")