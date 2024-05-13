FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . ./

RUN yarn workspaces focus push-serverless api-types && yarn workspace api-types build && yarn workspace push-serverless build

FROM ossrs/srs:4

RUN apt-get update &&\
  apt-get install -y \
  # KnzkLive
  ca-certificates gnupg openssl libssl-dev libc6 curl ffmpeg \
  # Caddy
  debian-keyring debian-archive-keyring apt-transport-https &&\
  # Node.js
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
  # Caddy
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg &&\
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list &&\
  apt-get update &&\
  apt-get install -y nodejs caddy &&\
  apt-get clean &&\
  rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

COPY ./vm/usr/local/srs/conf/knzklive.conf /usr/local/srs/conf/knzklive.conf
COPY ./vm/knzk/Caddyfile /knzk/Caddyfile
COPY ./vm/knzk/entry.sh /knzk/entry.sh
RUN chmod +x /knzk/entry.sh

COPY --from=builder /home/node/app/apps/push/dist /knzk/kernel

CMD ["/knzk/entry.sh"]
