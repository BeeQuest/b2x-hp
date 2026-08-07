#!/usr/bin/env python3
"""Firebase Hosting へ REST API 経由で静的サイトをデプロイする。

firebase CLI を使わないのは、CI で使える認証手段が Workload Identity 連携の
アクセストークンだけのため（組織ポリシー iam.disableServiceAccountKeyCreation
によりサービスアカウントキーを発行できない）。

使い方:
    ACCESS_TOKEN=... python3 scripts/deploy_hosting.py <site_id> <src_dir>

ACCESS_TOKEN が未設定のときは gcloud のトークンを使う（ローカル実行用）。
"""
import gzip
import hashlib
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

API = "https://firebasehosting.googleapis.com/v1beta1"

# アップロード対象から外すもの（サイトの一部ではないファイル）
IGNORE_NAMES = {"firebase.json", ".firebaserc", "render.yaml", "README.md"}
IGNORE_DIRS = {".git", ".github", "scripts", "node_modules", "docs"}

# firebase.json の hosting 設定と同じ内容をデプロイ時の config として送る
CONFIG = {
    "headers": [
        {
            "glob": "**",
            "headers": {
                "X-Content-Type-Options": "nosniff",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            },
        },
        {"glob": "**/*.@(css|js)", "headers": {"Cache-Control": "public, max-age=86400"}},
    ],
    "redirects": [
        {"glob": "/service-lms", "location": "/service-si.html", "type": 301},
        {"glob": "/service-lms.html", "location": "/service-si.html", "type": 301},
        {"glob": "/service-api", "location": "/service-si.html", "type": 301},
        {"glob": "/service-api.html", "location": "/service-si.html", "type": 301},
        {"glob": "/service-accounting", "location": "/service-beequest.html", "type": 301},
        {"glob": "/service-accounting.html", "location": "/service-beequest.html", "type": 301},
        {"glob": "/service-ax", "location": "/service-partners.html", "type": 301},
        {"glob": "/service-ax.html", "location": "/service-partners.html", "type": 301},
    ],
    "rewrites": [
        {"glob": "/company", "path": "/company.html"},
        {"glob": "/contact", "path": "/contact.html"},
        {"glob": "/faq", "path": "/faq.html"},
        {"glob": "/service-partners", "path": "/service-partners.html"},
        {"glob": "/service-beequest", "path": "/service-beequest.html"},
        {"glob": "/service-si", "path": "/service-si.html"},
    ],
}


def token():
    tok = os.environ.get("ACCESS_TOKEN")
    if tok:
        return tok.strip()
    return subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, check=True,
    ).stdout.strip()


def call(method, url, tok, body=None, raw=None, project=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {tok}")
    req.add_header("Content-Type", "application/octet-stream" if raw is not None else "application/json")
    if project:
        req.add_header("x-goog-user-project", project)
    try:
        with urllib.request.urlopen(req) as res:
            payload = res.read()
            return json.loads(payload) if payload and raw is None else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} {method} {url}\n{e.read().decode()}")


def collect(src):
    """{ '/index.html': gzip 済みバイト列 } を返す。"""
    out = {}
    for root, dirs, names in os.walk(src):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        for name in names:
            if name.startswith(".") or name in IGNORE_NAMES:
                continue
            full = os.path.join(root, name)
            rel = "/" + os.path.relpath(full, src).replace(os.sep, "/")
            with open(full, "rb") as f:
                out[rel] = gzip.compress(f.read(), 9)
    return out


def main():
    site = sys.argv[1]
    src = sys.argv[2]
    project = sys.argv[3] if len(sys.argv) > 3 else site
    tok = token()

    files = collect(src)
    if not files:
        sys.exit("アップロード対象のファイルがありません")
    digests = {p: hashlib.sha256(b).hexdigest() for p, b in files.items()}
    print(f"対象 {len(files)} ファイル（gzip後 {sum(len(b) for b in files.values())} bytes）")
    for p in sorted(files):
        print(f"  {p}")

    ver = call("POST", f"{API}/sites/{site}/versions", tok, {"config": CONFIG}, project=project)
    name = ver["name"]
    print(f"version: {name}")

    pop = call("POST", f"{API}/{name}:populateFiles", tok, {"files": digests}, project=project)
    need = pop.get("uploadRequiredHashes") or []
    upload_url = pop["uploadUrl"]
    print(f"要アップロード: {len(need)} 件")

    by_hash = {digests[p]: b for p, b in files.items()}
    for i, h in enumerate(need, 1):
        call("POST", f"{upload_url}/{h}", tok, raw=by_hash[h], project=project)
        print(f"  [{i}/{len(need)}] {h[:12]}…")

    call("PATCH", f"{API}/{name}?updateMask=status", tok, {"status": "FINALIZED"}, project=project)
    rel = call("POST", f"{API}/sites/{site}/releases?versionName={name}", tok, {}, project=project)
    print(f"released: {rel.get('name')}")
    print(f"https://{site}.web.app")


if __name__ == "__main__":
    main()
