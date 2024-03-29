# 配信者向け: 配信の視聴制限

複数の視聴制限機能を使用して、視聴者をコントロールすることができます。

## 免責事項

- [利用規約](https://nzws.notion.site/knzk-live-cbc2512a7ced4c80b93536d5ab671d13) に記載されている通り、サービスモデレーターは設定に関わらず進行されている配信を確認する事ができます。安全やプライバシーが理由で不特定多数に配信することができない内容は当サービスで絶対に配信しないでください。
- 全ての機能はアルファ版として提供されており、仕様は予告なく変更される可能性があります。また、予期せぬ挙動により正常に動作しない場合があります。予めご了承ください。

## 視聴制限の種類

### 公開範囲

配信の新規作成時に設定できます。

- **公開**: 全てのユーザーが視聴できます。
  - テナント設定で有効な場合かつ公開配信のみ KnzkLive のトップページに一覧表示されます。
- **ログインが必要**: KnzkLive にログインしたユーザーのみ視聴できます。

### アカウントのリレーション

配信の新規作成時に設定できます。この設定は公開範囲が「ログインが必要」の場合のみ設定できます。

- **視聴者はあなたをフォローしている必要がある（フォロワーである）**: 視聴者の KnzkLive アカウントに紐づく ActivityPub アカウントが、あなたの ActivityPub アカウントをフォローしている必要があります。
- **あなたは視聴者をフォローしている必要がある**: あなたの ActivityPub アカウントが、視聴者の ActivityPub アカウントをフォローしている必要があります。

#### 細かい仕様について

- ２つのリレーション設定は同時に設定可能です。つまり、2 つとも有効にすることで FF 内で配信をすることができます。
- リレーションの判定は、視聴者の視聴開始時に行われます。その時点で条件を満たしておらず、後からフォローを行った場合はキャッシュが残っているため 1 分後に再確認されます。
- 一度リレーションが確認できた場合、フォロー解除してもその配信は視聴し続ける事ができます。新たな配信を始めるとリレーションのキャッシュは削除されます。
- リレーションにより視聴できなかった場合、視聴者の UI には権限の問題で視聴できない旨のメッセージが表示されます。
