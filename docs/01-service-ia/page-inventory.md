# ページ一覧（残す / 統合 / 削除 / 新規）

最終更新: 2026-08-03（実装反映済）

## 実装後のソース（Eleventy）

| ソース | 出力 |
|---|---|
| `src/index.njk` | `_site/index.html` |
| `src/service-beequest.njk` | `_site/service-beequest.html` |
| `src/service-si.njk` | `_site/service-si.html` |
| `src/service-partners.njk` | `_site/service-partners.html` |
| `src/company.njk` | `_site/company.html` |
| `src/contact.njk` | `_site/contact.html` |
| `src/faq.njk` | `_site/faq.html` |
| `src/_includes/*` | topbar / header / footer / beequest-banner |

## 削除済み（旧ルートHTML）

| 旧ファイル | 統合先（Render rewrite） |
|---|---|
| `service-accounting.html` | `service-beequest.html` |
| `service-api.html` / `service-lms.html` | `service-si.html` |
| `service-ax.html` | `service-partners.html` |

## 後続（本フェーズ必須ではない）

- 利用規約・プライバシーポリシーページ
- 導入事例の実カード
- 資料ダウンロード専用ページ
- 提携先URLの確定
