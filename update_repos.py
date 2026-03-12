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
    # Gunakan visibility=all dan type=all agar private repo benar-benar dipaksa keluar
    url = 'https://api.github.com/user/repos?per_page=100&affiliation=owner&visibility=all&type=all'
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        repos = response.json()
        
        showcase_data = []
        
        for repo in repos:
            name = repo['name']
            
            # Abaikan repo website ini sendiri
            if name == "saiflll.github.io":
                continue
                
            print(f"Scanning: {name}...")
            
            # Format data simpel buat web
            showcase_data.append({
                "name": name,
                "is_private": repo['private'],
                "description": repo.get('description') or "Personal Project for Hobbies :3",
                "tech_stack": repo.get('language') or "Hardware/Embedded",
                "last_update": repo.get('updated_at')[:10] # Ambil tanggalnya aja (YYYY-MM-DD)
            })
            
        return showcase_data

    except Exception as e:
        print(f"Error pas ngambil data: {e}")
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