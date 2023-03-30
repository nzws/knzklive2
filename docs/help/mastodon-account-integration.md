# Mastodon/Misskey アカウントとの連携について

KnzkLive プラットフォームでは、Mastodon/Misskey アカウントを使用してログインすることができます。
Mastodon/Misskey アカウントでログインすると、KnzkLive あなたのアカウント情報の一部を取得し、一部の操作が実行できるようになります。

KnzkLive では、Mastodon/Misskey アカウントのトークン（認証情報）はブラウザに保管され、サーバーに記録される事はありません。
一部の情報取得や操作において、サーバーに一時的にトークンを送信し、サーバー上で Mastodon/Misskey API を実行することがあります。

## Mastodon/Misskey アカウントで取得する情報とタイミング

- ログインするとき
  - アカウントの ID (例: knzk@knzk.me)
  - 表示名
  - アバター画像の URL
- KnzkLive 側のトークンが切れたとき、再ログインを実行
  - ログイン時と同様の情報

## Mastodon/Misskey アカウントで操作する内容とタイミング

- コメント投稿時、公開投稿をオンにして投稿した場合
  - KnzkLive 上で投稿したコメントを Mastodon/Misskey に投稿
  - ブラウザ上で Mastodon/Misskey API に送信します
