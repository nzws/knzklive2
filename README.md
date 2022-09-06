# KnzkLive2

[![Lint/Test](https://github.com/nzws/knzklive2/actions/workflows/node.yml/badge.svg)](https://github.com/nzws/knzklive2/actions/workflows/node.yml)
[![Staging image](https://github.com/nzws/knzklive2/actions/workflows/stg-release.yml/badge.svg)](https://github.com/nzws/knzklive2/actions/workflows/stg-release.yml)
[![Production image](https://github.com/nzws/knzklive2/actions/workflows/release.yml/badge.svg?branch=production)](https://github.com/nzws/knzklive2/actions/workflows/release.yml)

> Open source, customizable, scalable live-streaming service

## Packages

- apps
  - [edge](./apps/edge/README.md) - KnzkLive Edge Network: Publish live streams to the world in real time, powered by Cloudflare Workers.
  - [push](./apps/push/README.md) - KnzkLive Push Server: A server that receives RTMP and publish to Edge Network and converts videos.
  - [server](./apps/server/README.md) - KnzkLive Server: A server that provides API.
  - [web](./apps/web/README.md) - KnzkLive Web: A web client built with Next.js.
- packages
  - [api-types](./packages/api-types/README.md) - KnzkLive API types, generated by Aspida.
