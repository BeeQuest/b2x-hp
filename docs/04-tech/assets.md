# アセット整理方針

最終更新: 2026-08-03

## 現状

- ルート直下: `logo.png`, `ogp.png`, `favicon.svg`
- コンテンツ画像の多くが Unsplash CDN
- 代表写真: `images/company/representative.jpg`（配置済み）

## 目標構成

```
images/
  company/
    representative.jpg   # 代表 金子佳樹（配置済み）
  partners/
    exs-kaikei.svg       # TBD
    exs-flema.svg        # TBD
  ogp/
    ogp.png              # 既存 ogp.png を移動または参照維持
  brand/
    logo.png
```

当面、公開に必要なパスが壊れないよう `logo.png` / `ogp.png` / `favicon.svg` はルートに残してもよい。新規素材は `images/` 配下へ。

## 方針

1. 代表写真: `images/company/representative.jpg` を `company` ページで表示（対応済み）
2. 提携ロゴ: URL確定と同時に `images/partners/` へ
3. Unsplash: 装飾用途は段階的に削減。必須でなければ SVG / CSS で代替
4. 著作権: ストック写真を残す場合はライセンス確認

## フォールバック

`company.njk` は写真読み込み失敗時に Font Awesome `fa-user` へ切り替える。
