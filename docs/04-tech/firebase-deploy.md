# Firebase Hosting デプロイ方針

最終更新: 2026-08-07

## 正本

| 項目 | 内容 |
|---|---|
| プロジェクト | `b2x-hp` |
| 公開ディレクトリ | リポジトリルート（`firebase.json` の `"public": "."`） |
| 本番 URL | https://b2x.co.jp / https://www.b2x.co.jp / https://b2x-hp.web.app |
| 自動デプロイ | `.github/workflows/deploy.yml`（`main` push / 手動 `workflow_dispatch`） |
| 認証 | GitHub → Workload Identity → `gh-deploy@b2x-hp.iam.gserviceaccount.com` |
| 実装 | `scripts/deploy_hosting.py`（REST。SA キー発行禁止ポリシー向け） |

## 金子側のデプロイ手順（推奨）

1. 変更は feature ブランチ → PR → **`main` へ merge**
2. GitHub Actions「Deploy to Firebase Hosting」が自動実行される
3. Firebase 個人アカウント新規作成は **不要**（CI がデプロイする）

GitHub 権限: `BeeQuest/b2x-hp` に admin/push があれば merge 可能。

## コンソール閲覧・手動デプロイが必要な場合

宮澤さんへ IAM 追加を依頼する（下の文面を送付）。

- 閲覧のみ: `roles/viewer`
- 手動デプロイもするなら Hosting / Firebase 関連ロールを追加

ローカル手動の例（IAM 付与後）:

```bash
gcloud auth login
ACCESS_TOKEN=$(gcloud auth print-access-token) \
  python3 scripts/deploy_hosting.py b2x-hp . b2x-hp
```

## 宮澤さんへの依頼文（コピー用）

```
お疲れさまです。b2x-hp の運用について確認です。

1. デプロイは main merge → GitHub Actions → Firebase Hosting で進めてよいか
2. コンソール確認用に、GCP/Firebase プロジェクト b2x-hp へ
   私の Google アカウント（kaneyoshi0729@gmail.com）を
   Viewer（必要なら Hosting デプロイ権限も）で追加いただけますか

よろしくお願いいたします。
```

## 注意

- 旧 Render 設定（`render.yaml`）は残っていても、本番は Firebase が正
- Eleventy 時代の `"public": "_site"` 設定は使わない
