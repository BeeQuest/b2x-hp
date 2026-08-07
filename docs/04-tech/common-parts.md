# 共通パーツ化方針

最終更新: 2026-08-03

## 問題

現状、次のブロックが各 HTML にコピペされている。

- Topbar
- Header / グローバルナビ（メガメニュー含む）
- BeeQuest バナー
- Footer
- ページトップボタン + `script.js` 読み込み

リンク修正やサービス再編のたびに全ページ更新が必要になっている。

## 方針（実装済）

**Eleventy（11ty）** で部分テンプレート化済み。

### ディレクトリ

```
src/
  _includes/
    topbar.njk
    header.njk
    footer.njk
    beequest-banner.njk
  _layouts/
    base.njk
  _data/
    eleventyComputed.js   # *.html パーマリンク
  *.njk
style.css / script.js / images/  # passthrough
_site/                           # ビルド出力（gitignore）
```

### ローカル

```bash
npm install
npm run build    # → _site/
npm run dev      # ローカルプレビュー
```

### Render

```yaml
buildCommand: npm ci && npm run build
staticPublishPath: _site
```

### アクティブナビ

レイアウトに `pageId` 等を渡し、該当リンクに `aria-current="page"` を付ける。

## 旧URL

削除ページは Render `routes` で統合先へ rewrite:

| source | destination |
|---|---|
| `/service-accounting.html` | `/service-beequest.html` |
| `/service-api.html` | `/service-si.html` |
| `/service-lms.html` | `/service-si.html` |
| `/service-ax.html` | `/service-partners.html` |
| `/faq` | `/faq.html`（任意） |
| `/service-beequest` 等 | 対応 html（任意で拡張） |
