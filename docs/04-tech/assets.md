# アセット整理方針

最終更新: 2026-08-03

## 現状

- ルート直下: `logo.png`, `ogp.png`, `favicon.svg`
- コンテンツ画像の多くが Unsplash CDN
- 代表写真なし（Font Awesome `fa-user`）
- `images/` ディレクトリなし

## 目標構成

```
images/
  company/
    representative.jpg   # 代表 金子佳樹（素材入手後）
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

1. 代表写真: 入手後 `images/company/representative.jpg` に配置し `company` ページで使用
2. 提携ロゴ: URL確定と同時に `images/partners/` へ
3. Unsplash: 装飾用途は段階的に削減。必須でなければ SVG / CSS で代替
4. 著作権: ストック写真を残す場合はライセンス確認

## プレースホルダ

代表写真未入手の間は、円形アバター枠 + 写真パスを用意し、ファイルが無い場合は既存アイコンフォールバックでも可。実装時は `images/company/representative.jpg` を参照するマークアップにし、素材追加だけで表示されるようにする。
