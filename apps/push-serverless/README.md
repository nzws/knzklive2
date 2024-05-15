# knzklive2/push-serverless (push v3)

> (Super experimental) KnzkLive: Serverless Push Service

⚠ This is a experimental service and sometimes it is exploded.

## Concepts

- 主に fly.io 上で動作させる事を目的としたサーバーレスプッシュサービスの実験です
  - プッシュサーバーに必要なプロセスを一つのイメージに全て詰め込み、無理やり一つの Firecracker VM 上で動作させます
- 使用者がいないときはゼロスケールしインフラコストを極限まで抑えることに焦点を当てています
- Fly Proxy によって TLS 接続を生の TCP に変換させる事で、間接的に RTMPS に対応します

## Spec

- 以下のプロセスが一つの Firecracker VM 内で動作します
  - Caddy - 静的ファイルの配信とリバースプロキシ
  - SRS - RTMP サーバー
  - KnzkLive Push Agent - 制御基盤
  - FFmpeg - ビデオエンコーダ

```mermaid
graph LR
    api["KnzkLive API"]
	  caddy["Caddy"]
    srs["SRS"]
    agent["KnzkLive Push Agent"]
    ffmpeg["FFmpeg"]
    storage["ストレージ"]

    streamer(["配信者"])
    viewer(["視聴者"])

    streamer -- RTMP(S) 映像 --> srs
    streamer -- WebSocket 映像 (ブラウザ配信) --> agent

    agent <-- 状態制御/認証 --> api

    subgraph KnzkLive: Serverless Push Service
      agent -- WebSocket 映像 --> ffmpeg
      ffmpeg -- RTMP 映像 --> srs

      srs <-- 認証 --> agent
      agent -- エンコーダ制御 --> ffmpeg
      srs -- RTMP 映像 --> ffmpeg

      ffmpeg -- HLS --> storage

      caddy --> storage
      caddy --> srs
    end

    caddy -- FLV (低遅延) --> viewer
    caddy -- HLS --> viewer

```

## Limitations

- 水平方向へのスケーリングは行えません
  - 現状の設計だと根本的にできないので、v4 作るときは設計からやり直したさがある
