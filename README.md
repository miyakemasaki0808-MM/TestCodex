# TestCodex Site

Vite で作った静的サイトを GitHub Pages に公開する学習用プロジェクトです。

公開URL: https://miyakemasaki0808-mm.github.io/TestCodex/

## 必要なもの

- Node.js `^20.19.0 || >=22.12.0`（推奨バージョンは `.nvmrc` の 24。CI もこれを使います）

`.npmrc` で `engine-strict=true` にしているため、対応外の Node では `npm install` が失敗します。

## Node.js をプロジェクト内だけで使う

PC 全体に Node.js をインストールせず、`.tools/node/` に置いたものを使う構成にしています（`.tools/` は Git 管理外）。

1. [Node.js 公式サイト](https://nodejs.org/) から、OS に合ったアーカイブ版（Windows は `.zip`、Mac/Linux は `.tar.gz`）をダウンロードする
2. 展開したフォルダの中身を `.tools/node/` に置く
   - Windows: `.tools/node/npm.cmd` があればOK
   - Mac/Linux: `.tools/node/bin/npm` があればOK
3. `npm` の代わりにラッパーを使う

```bat
npm-local.cmd install
npm-local.cmd run dev
```

```bash
./npm-local.sh install
./npm-local.sh run dev
```

npm のキャッシュ（`.npm-cache/`）とグローバルインストール先（`.npm-global/`）もプロジェクト内に置かれます。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動（http://localhost:5173/TestCodex/） |
| `npm run build` | `dist/` に本番用ファイルを出力 |
| `npm run preview` | ビルド結果をローカルで確認 |

## デプロイ

`main` ブランチに push すると、`.github/workflows/deploy-pages.yml` がビルドして GitHub Pages に公開します。Actions 画面から手動で実行することもできます。

`vite.config.js` の `base: "/TestCodex/"` は、リポジトリ名に合わせたものです。リポジトリ名を変えたり独自ドメインを使ったりする場合は、ここも変更してください。
