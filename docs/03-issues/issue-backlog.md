# GitHub Issue バックログ

最終更新: 2026-08-03  
正本: 本ファイル。GitHub に Issue を作成したら番号を追記する。

## 既存 Issue

| # | タイトル | 状態 | メモ |
|---|---|---|---|
| #1 | お問い合わせフォームの送信先が未設定 | OPEN | 2026-08-03 に宮澤さん相談事項をコメント追記済み。詳細は `docs/04-tech/contact-form.md` |
| #2 | リポジトリのprivate化とRenderデプロイの設定調整 | OPEN | 本再設計とは独立 |

## 作成済み Issue（再設計）

| # | タイトル | 対応 docs |
|---|---|---|
| #3 | サービス見せ方を3柱に再編 | `docs/01-service-ia/` |
| #4 | BeeQuest育成支援ページ・トップセクションの文言更新 | `docs/02-copy-drafts/service-beequest.md` |
| #5 | 受託システム開発ページにLMS・API等を統合 | `docs/02-copy-drafts/service-si.md` |
| #6 | 提携による支援ページ新設 | `docs/02-copy-drafts/service-partners.md` |
| #7 | meta・hero・FAQ・フッターを3柱に合わせて整合 | `docs/01-service-ia/messaging-guidelines.md` |
| #8 | 会社概要ページに代表者写真を配置 | `docs/04-tech/assets.md` |
| #9 | header / footer 等を Eleventy で共通化 | `docs/04-tech/common-parts.md` |
| #10 | images/ 配下に素材を整理 | `docs/04-tech/assets.md` |

## Issue 作成コマンド例

```bash
gh issue create --title "..." --body "$(cat <<'EOF'
...
EOF
)"
```
