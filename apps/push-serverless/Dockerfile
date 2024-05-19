FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . ./

RUN yarn workspaces focus push-serverless api-types && yarn workspace api-types build && yarn workspace push-serverless build

FROM ossrs/srs:5

RUN apt-get update &&\
  apt-get install -y \
  ca-certificates gnupg openssl libssl-dev libc6 curl ffmpeg nginx &&\
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - &&\
  apt-get install -y nodejs &&\
  apt-get clean &&\
  rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/local/srs/objs/ffmpeg/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

COPY ./apps/push-serverless/vm/usr/local/srs/conf/knzklive.conf /usr/local/srs/conf/knzklive.conf
COPY ./apps/push-serverless/vm/etc/nginx/conf.d/knzklive.conf /etc/nginx/conf.d/knzklive.conf
COPY ./apps/push-serverless/vm/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./apps/push-serverless/vm/knzk/entry.sh /knzk/entry.sh
RUN chmod +x /knzk/entry.sh

COPY --from=builder /home/node/app/apps/push-serverless/dist /knzk/kernel

CMD ["/knzk/entry.sh"]
