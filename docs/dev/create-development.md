# 開発環境の立ち上げ方

## 必要なもの

- Docker / Docker Compose
- Node.js v18.x~
- Yarn

## Mastodon に対する要件

- ハッシュタグタイムラインが未収載投稿を拾うように Mastodon API 側を改造する必要があります

## 起動

```bash
# 初回
cp .env.development .env
yarn
yarn workspace server prisma generate
yarn workspace server cli generateKey >> .env

# 毎回
yarn
yarn dev-all
```

- Web: http://localhost:3000

## テナントの作成

- テナント（配信者アカウント）を CLI 上で作成します。
- `nzws@don.nzws.me` の部分は自分の Mastodon アカウントの id@domain に置き換えてください。

```bash
yarn workspace server cli addUser --account=nzws@don.nzws.me --create-tenant
```

## DB データ参照

```bash
yarn dev:sql
```
