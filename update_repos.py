"""
update_repos.py — Smart GitHub Repo Sync v2.0
================================================
Features:
  - Fetches all repos from GitHub API
  - Checks each repo for `img/`, `docs/` folders via GitHub Contents API
  - Links to first image found, or docs folder URL
  - MANUAL OVERRIDE PROTECTION: if you manually edited a field in
    repos_data.json, this script will NOT overwrite it.
    Only fields that still have auto-generated defaults get updated.
  - Adds `github_url` to every entry

MANUAL OVERRIDE RULES:
  Any field you manually set to a non-default value will be preserved.
  Auto-detected defaults that are considered "replaceable":
    description : "Development Project and Hobbies"
    tech_stack  : "Mixed Tech"
    category    : (auto-guessed from description/tech)
    img         : "" or null
    doc         : "" or null
"""

import requests
import json
import os

# ── LOAD TOKEN from .env or OS environment ────────────────────────────────────
def _load_token() -> str:
    """
    Token resolution priority:
      1. .env file  →  token_class  (local dev, classic token)
      2. .env file  →  token / MY_GITHUB_TOKEN / GITHUB_TOKEN  (fine-grained fallback)
      3. OS env var →  TOKEN_CLASS  (GitHub Actions secret)
      4. OS env var →  MY_GITHUB_TOKEN / GITHUB_TOKEN  (other CI env vars)

    In GitHub Actions:
      Set a repository secret named TOKEN_CLASS with your classic token value.
      The workflow passes it as:  env: TOKEN_CLASS: ${{ secrets.TOKEN_CLASS }}
    """
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    found = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, val = line.partition('=')
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key in ('token_class', 'token', 'MY_GITHUB_TOKEN', 'GITHUB_TOKEN'):
                    found[key] = val

        token = (
            found.get('token_class') or
            found.get('MY_GITHUB_TOKEN') or
            found.get('GITHUB_TOKEN') or
            found.get('token') or
            ''
        )
        if token:
            print(f"[ENGINE] Token source: .env ({'classic' if found.get('token_class') else 'fine-grained'})")
            return token

    for env_key in ('TOKEN_CLASS'): , #'MY_GITHUB_TOKEN', 'GITHUB_TOKEN'
        val = os.getenv(env_key, '').strip()
        if val:
            print(f"[ENGINE] Token source: OS env → {env_key} (GitHub Actions secret)")
            return val

    print("[WARN] No token found. Only public repos will be accessible.")
    return ''


TOKEN    = _load_token()
USERNAME = 'saiflll'
OUTPUT   = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'repos_data.json')

SKIP_REPOS = {'saiflll.github.io', 'saiflll.github.io'.lower()}
AUTO_DEFAULTS = {
    None, '', 
    'Development Project and Hobbies',
    'Active Engineering Project',
    'Mixed Tech',
}

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
}

IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'}

def load_existing() -> dict:
    """Load current repos_data.json, keyed by repo name."""
    try:
        with open(OUTPUT, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {item['name']: item for item in data if 'name' in item}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def is_manual(value) -> bool:
    """Return True if the value was manually set (not an auto-generated default)."""
    return value not in AUTO_DEFAULTS


def get_folder_contents(repo: str, path: str) -> list | None:
    """Fetch contents of a specific folder in a repo. Returns list or None."""
    url = f'https://api.github.com/repos/{USERNAME}/{repo}/contents/{path}'
    try:
        res = requests.get(url, headers=headers, timeout=6)
        if res.status_code == 200:
            data = res.json()
            return data if isinstance(data, list) else None
    except Exception:
        pass
    return None


def find_image_url(repo: str) -> str:
    """
    Look for image files in common folders: img/, images/, assets/, docs/
    Returns the raw download URL of the first image found, or empty string.
    """
    candidate_folders = ['img', 'images', 'assets', 'docs', 'screenshots']
    for folder in candidate_folders:
        contents = get_folder_contents(repo, folder)
        if not contents:
            continue
        for item in contents:
            name = item.get('name', '')
            ext  = os.path.splitext(name)[1].lower()
            if item.get('type') == 'file' and ext in IMAGE_EXTS:
                # Prefer download_url (direct raw link), fallback to html_url
                return item.get('download_url') or item.get('html_url') or ''
    return ''


def find_doc_url(repo: str) -> str:
    """
    Look for docs/ or doc/ folder. If found, return URL to folder/README inside.
    If not found, fall back to checking for a README in the root directory.
    """
    candidate_folders = ['docs', 'doc', 'documentation']
    for folder in candidate_folders:
        contents = get_folder_contents(repo, folder)
        if contents is None:
            continue
        # Check for README inside docs
        for item in contents:
            if item.get('type') == 'file' and 'readme' in item['name'].lower():
                return item.get('html_url') or ''
        return f'https://github.com/{USERNAME}/{repo}/tree/HEAD/{folder}'
    
    root_contents = get_folder_contents(repo, '')
    if root_contents:
        for item in root_contents:
            if item.get('type') == 'file' and 'readme' in item['name'].lower():
                return item.get('html_url') or ''
                
    return ''


def fetch_readme_body(repo: str) -> str:
    """
    Fetch the README and extract the first meaningful paragraph
    to use as a repository description.
    """
    url = f'https://api.github.com/repos/{USERNAME}/{repo}/readme'
    try:
        res = requests.get(url, headers={'Authorization': headers['Authorization'], 'Accept': 'application/vnd.github.raw'}, timeout=6)
        if res.status_code == 200:
            content = res.text
            lines = content.split('\n')
            paragraphs = []
            for line in lines:
                line = line.strip()
                if not line or line.startswith('#') or line.startswith('[') or line.startswith('!'):
                    continue
                # If we get here, it's likely a text paragraph
                paragraphs.append(line)
                if len(paragraphs) > 1: # Get at most 2 lines for a short blurb
                    break
            
            if paragraphs:
                blurb = " ".join(paragraphs)
                
                # NEW: Strip HTML tags to prevent layout breakage
                import re
                blurb = re.sub(r'<[^>]+>', '', blurb)
                
                # Trim to a reasonable length
                if len(blurb) > 160:
                    blurb = blurb[:157] + "..."
                return blurb
    except Exception:
        pass
    return ''


def smart_category(desc: str, tech: str) -> str:
    """Auto-guess category from description and tech_stack."""
    d = (desc  or '').lower()
    t = (tech  or '').lower()

    hardware_keywords  = {'c++', 'c', 'esp32', 'esp8266', 'stm', 'arduino', 'nrf',
                          'avr', 'rtos', 'plc', 'firmware', 'pcb', 'rf', 'uart',
                          'hardware', 'embedded', 'modbus', 'rs485', 'i2c', 'spi'}
    support_keywords   = {'dashboard', 'monitor', 'support', 'admin', 'management',
                          'website', 'web', 'utility', 'helper', 'tool', 'portal',
                          'ui', 'interface', '.env'}


    if any(k in t for k in hardware_keywords) or any(k in d for k in hardware_keywords):
        return 'hardware'
    if any(k in d for k in support_keywords):
        return 'support'
    return 'logic'


# ── MAIN ─────────────────────────────────────────────────────────────────────
def fetch_all_repos() -> list:
    """
    Try authenticated /user/repos first (includes private repos).
    If token is missing or invalid, fall back to public-only endpoint.
    """
    auth_url    = 'https://api.github.com/user/repos?per_page=100&type=all&sort=updated'
    public_url  = f'https://api.github.com/users/{USERNAME}/repos?per_page=100&sort=updated'

    for label, url in [('authenticated (all repos)', auth_url), ('public fallback', public_url)]:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            print(f"[ENGINE] {label} → HTTP {res.status_code}")

            if res.status_code == 401:
                print(f"[ENGINE] Token invalid or missing — trying next endpoint.")
                continue
            if res.status_code == 403:
                print(f"[ENGINE] Rate-limited or forbidden — trying next endpoint.")
                continue

            res.raise_for_status()
            data = res.json()

            if not isinstance(data, list):
                print(f"[ENGINE] Unexpected response: {type(data)}")
                continue

            private_count = sum(1 for r in data if r.get('private'))
            public_count  = len(data) - private_count
            print(f"[ENGINE] Fetched {len(data)} repos  (public: {public_count}, private: {private_count})")
            return data

        except Exception as e:
            print(f"[ENGINE] Error on {label}: {e}")
            continue

    print("[ERROR] All endpoints failed. Aborting.")
    return []


# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    existing = load_existing()
    print(f"[ENGINE] Loaded {len(existing)} existing entries from {OUTPUT}.")
    repos = fetch_all_repos()
    if not repos:
        print("[ERROR] No repos fetched. Aborting.")
        return

    output = []

    for repo in repos:
        name = repo['name']
        is_archived = repo.get('archived', False)
        is_fork     = repo.get('fork', False)
        
        if name.lower() in {r.lower() for r in SKIP_REPOS}:
            continue
        if is_archived:
            continue
        if is_fork:
            continue
            
        prev = existing.get(name, {})
        
        gh_desc = repo.get('description')
        auto_desc = gh_desc
        
        if not gh_desc or gh_desc in AUTO_DEFAULTS:
            print(f" (no desc, fetching README...)", end='', flush=True)
            readme_blurb = fetch_readme_body(name)
            if readme_blurb:
                auto_desc = readme_blurb
            else:
                auto_desc = 'Development Project and Hobbies'

        auto_tech   = repo.get('language')    or 'Mixed Tech'
        auto_update = (repo.get('updated_at') or '')[:10]
        auto_cat    = smart_category(auto_desc, auto_tech)

        print(f"  → Scanning: {name} ...", end=' ', flush=True)
        auto_img = find_image_url(name)
        auto_doc = find_doc_url(name)
        print(f"img={'✓' if auto_img else '✗'}  doc={'✓' if auto_doc else '✗'}")

        # ── Merge: manual wins, auto fills empty slots ────────────────────
        def resolve(field, auto_value, _prev=prev):
            prev_val = _prev.get(field)
            return prev_val if is_manual(prev_val) else auto_value

        entry = {
            'name':        name,
            'is_private':  repo.get('private', False),
            'description': resolve('description', auto_desc),
            'tech_stack':  resolve('tech_stack',  auto_tech),
            'category':    resolve('category',    auto_cat),
            'img':         resolve('img',         auto_img),
            'doc':         resolve('doc',         auto_doc),
            'last_update': auto_update,
            'github_url':  f'https://github.com/{USERNAME}/{name}',
        }

        output.append(entry)

    # 3. Write output
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)

    print(f"\n[ENGINE] ✓ Done — {len(output)} repos written to {OUTPUT}")
    print(f"[ENGINE] Manual edits preserved. Private repos included if token valid.")


if __name__ == '__main__':
    main()