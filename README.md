# TestCodex Site

Vite で作った静的サイトを GitHub Pages に公開する学習用プロジェクトです。

公開URL: https://miyakemasaki0808-mm.github.io/TestCodex/

## 必要なもの

- Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`（推奨バージョンは `.nvmrc` の 24。CI もこれを使います）

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

| コマンド               | 内容                                                      |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | 開発サーバーを起動（http://localhost:5173/TestCodex/）    |
| `npm run build`        | `dist/` に本番用ファイルを出力                            |
| `npm run preview`      | ビルド結果をローカルで確認                                |
| `npm test`             | Vitest で単体テストを実行                                 |
| `npm run test:watch`   | ファイルの変更を監視してテストを再実行                    |
| `npm run lint`         | ESLint でコードを検査                                     |
| `npm run format`       | Prettier でコードを整形                                   |
| `npm run format:check` | 整形されているかだけ確認（CI 用）                         |
| `npm run check`        | lint・整形確認・テスト・ビルドをまとめて実行（push 前に） |

## デプロイ

`main` ブランチに push すると、`.github/workflows/deploy-pages.yml` がビルドして GitHub Pages に公開します。Actions 画面から手動で実行することもできます。

`vite.config.js` の `base: "/TestCodex/"` は、リポジトリ名に合わせたものです。リポジトリ名を変えたり独自ドメインを使ったりする場合は、ここも変更してください。

## CI とセキュリティ

PR と `main` への push のたびに `.github/workflows/ci.yml` が動きます。

| ジョブ                 | 内容                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| Lint, format and build | `npm ci` → lint → 整形チェック → テスト → ビルド → `npm audit --audit-level=high` |
| Dependency review      | PR で追加・更新される依存に、high 以上の脆弱性がないか確認                        |
| Audit workflows        | [zizmor](https://docs.zizmor.sh/) で GitHub Actions の設定の危険な書き方を検査    |

ワークフローを書くときの方針は次のとおりです。

- Actions はタグではなくコミット SHA で固定する（タグは後から付け替えられるため）。更新は Dependabot に任せる
- `permissions` は最小限にし、書き込み権限が必要なジョブにだけ付ける
- `actions/checkout` は `persist-credentials: false` にして、後続のステップにトークンを残さない

依存関係は `.github/dependabot.yml` で毎週チェックします。公開直後の悪意あるバージョンを避けるため、公開から 7 日経ったものだけを提案させています（`cooldown`）。

### 既知の脆弱性で、受け入れているもの

- `minimatch`（ESLint の依存、moderate）: グロブパターンを攻撃者が指定できる場合に限る DoS。ESLint は手元と CI でしか動かず、サイトにも含まれないため受け入れている。ESLint 側の更新で解消されたら外す
