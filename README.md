# KnzkLive2

[![Lint/Test](https://github.com/nzws/knzklive2/actions/workflows/node.yml/badge.svg)](https://github.com/nzws/knzklive2/actions/workflows/node.yml)

> Open source, federated, unlimited live-streaming service

**This project is still in development and currently not designed for self-hosting.**

![image](https://user-images.githubusercontent.com/14953122/192090145-cb30b24b-7fff-4397-9e46-7fd52c8c371a.png)

## Features

### Unlimited live-streaming

- Except for technical limitations, there is never a set limit on live-streaming time.
- The live-streaming server is also hosted by the server administrator, so the server administrator can set the rules.

### Integrate with ActivityPub

- Receive live streaming comments from public posts on ActivityPub. (Not an ActivityPub server, uses Mastodon API)
- You can log in with Mastodon or Misskey server.

### Low latency, watch on any device

- Live-streaming can be broadcasted from the streamer to the viewer with a minimum delay of 1 second, powered by SRS Server. (iOS is not supported to low-latency streaming)
- Encodes video into multiple formats in real-time so it can watch on any device, including iOS, and can watch on the go in low-quality mode.

### Publish live-streaming from any device

- You can broadcast with common broadcast software such as OBS.
- You can also broadcast from the mobile device without broadcast software by using the "Broadcast via browser" feature.

## Development

For create the development environment, Please see [docs/dev/create-development.md](./docs/dev/create-development.md).

### Packages

- apps
  - [video](./apps/video/README.md) - KnzkLive Video Agent (KnzkVideo): A server that convert and provide recorded video.
  - [push](./apps/push/README.md) - KnzkLive Push Agent: A server that manage video authentication and convert video.
  - [server](./apps/server/README.md) - KnzkLive Server: A server that provides API.
  - [web](./apps/web/README.md) - KnzkLive Web: A web client built with Next.js.
- packages
  - [api-types](./packages/api-types/README.md) - KnzkLive API type definitions, generated with Aspida.

## Self-hosting

WIP

## Build status

[![Staging - x64](https://github.com/nzws/knzklive2/actions/workflows/release-stg.yml/badge.svg)](https://github.com/nzws/knzklive2/actions/workflows/release-stg.yml)

[![Production - x64](https://github.com/nzws/knzklive2/actions/workflows/release-prod.yml/badge.svg?branch=production)](https://github.com/nzws/knzklive2/actions/workflows/release-prod.yml)

[![CircleCI](https://img.shields.io/circleci/build/github/nzws/knzklive2/main?label=Release%20-%20staging%2Farm64)](https://dl.circleci.com/status-badge/redirect/gh/nzws/knzklive2/tree/main)

[![CircleCI](https://img.shields.io/circleci/build/github/nzws/knzklive2/production?label=Release%20-%20production%2Farm64)](https://dl.circleci.com/status-badge/redirect/gh/nzws/knzklive2/tree/production)

## License

[AGPL-3.0](./LICENSE)
