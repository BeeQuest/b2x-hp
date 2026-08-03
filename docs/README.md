# B2X ホームページ検討ドキュメント

このフォルダは、株式会社B2Xコーポレートサイト（本リポジトリ）の再設計に関する検討内容・文言正本・技術方針をまとめたものです。

## 目的

- AI生成ベースの現行サイトを、実務で提供できるサービス内容に整合させる
- サービス情報設計・コピー・Issue・技術方針を実装前に正本化する
- 後続の「Bequest Internal Docs」への移行を容易にする

## 移行先（予定）

後ほど社内ドキュメント置き場へ手動移行します。

| 移行先（想定） | 内容 |
|---|---|
| Bequest Internal Docs / ホームページ検討内容 | 本 `docs/` 配下の IA・文言・Issue・技術方針 |
| Bequest Internal Docs / 変更点 | 実装後の差分サマリ（別途作成） |

移行時はクラウドストレージ等を使い、本リポジトリの `docs/` はそのまま残しても削除しても構いません。

## 構成

```
docs/
  README.md
  00-overview/
    project-status.md
  01-service-ia/
    service-structure.md
    messaging-guidelines.md
    page-inventory.md
  02-copy-drafts/
    top-services.md
    service-beequest.md
    service-si.md
    service-partners.md
  03-issues/
    issue-backlog.md
  04-tech/
    common-parts.md
    assets.md
    contact-form.md
```

## 確定方針（要約）

サービス見せ方は次の **3柱** に再編する。

1. BeeQuest育成支援
2. 受託システム開発
3. 提携による支援

詳細は [01-service-ia/service-structure.md](01-service-ia/service-structure.md) を正本とする。
