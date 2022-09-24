# 開発環境の立ち上げ方

## 必要なもの

- Docker / Docker Compose
- Node.js v18.x~
- Yarn

## 起動

```bash
# 初回
cp .env.development .env
yarn
yarn workspace server prisma generate
yarn workspace server cli generateKey >> .env

# 毎回
yarn
yarn dev
yarn dev:migrate
```

- Web: http://localhost:3000

## テナントの作成

データベースを作ったばかりの場合、テナントが存在しないと全ての Web リクエストは 404 を返します。
そのため、初回は CLI でテナントとアカウントを作成する必要があります。

- `nzws@don.nzws.me` の部分は自分の Mastodon アカウントの id@domain に置き換えてください。
- `localhost:3000` はカスタムドメインとして指定します。開発サーバーに向いているドメインがあればそちらも使用できます。(ポート番号は Next.js 開発サーバーの 3000 を指定してください。NODE_ENV=development 時のみカスタムのポート番号が許容されます。)

```bash
yarn workspace server cli addUser --account=nzws@don.nzws.me --create-tenant=localhost:3000
```
