# パワーユーザー向け: Webhook URL の設定

Webhook 連携を使用して、配信に関するイベント発生時にリアルタイムにあなたのサービスへ通知を送信することができます。

## 設定方法

1. トップページからあなたのアイコンをクリック
2. 該当のテナントから「配信設定」をクリック
3. 「Webhook URL」に通知を送信したい URL を入力
4. 保存

## 制限

- 4xx/5xx のステータスコードを返した場合は KnzkLive バックエンド上ではエラーとして扱いますが、リトライすることはありません。
- タイムアウトは 5 秒です。
- 今のところ、全てのイベントが単一の URL に送信されます。
- 今のところ、送信されるイベントを制御することはできません。
  - セキュリティ上の理由から、制御機能が追加されるまでは `privacy: "Private"` (UI 上で「ログインが必要」) の配信が関わるイベントは Webhook が送信されません。
- 今のところ、リクエストに対する署名は付与されていません。共通鍵をクエリに含めるなどで対応してください。

## 送信される情報

- 情報は POST リクエストで送信されます。
- リクエストボディは JSON 形式です。

### 配信開始

- type: `live:started`
- live: 配信の公開データ

```json
{
  "type": "live:started",
  "live": {
    "id": 1,
    "idInTenant": 1,
    "userId": 1,
    "startedAt": "2022-01-01T00:00:00.000Z",
    "title": "配信タイトル",
    "privacy": "Public",
    "sensitive": false,
    "isPushing": true,
    "publicUrl": "https://knzk.live/@example/1",
    "tenant": {
      "id": 1,
      "slug": "example",
      "ownerId": 1
    }
  }
}
```
