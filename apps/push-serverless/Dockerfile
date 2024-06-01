FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY . ./

RUN yarn workspaces focus push-serverless api-types && yarn workspace api-types build && yarn workspace push-serverless build

FROM ossrs/srs:6

RUN apt-get update &&\
  apt-get install -y \
  ca-certificates gnupg openssl libssl-dev libc6 curl nginx wget unzip &&\
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - &&\
  apt-get install -y nodejs &&\
  apt-get clean &&\
  rm -rf /var/lib/apt/lists/*

ENV FFMPEG_VERSION=6.1
ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/local/bin/ffmpeg
ENV FFPROBE_PATH=/usr/local/bin/ffprobe

RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        ARCH="64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        ARCH="arm-64"; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    URL="https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v${FFMPEG_VERSION}/ffmpeg-${FFMPEG_VERSION}-linux-${ARCH}.zip" && \
    wget $URL -O /tmp/ffmpeg.zip && \
    unzip /tmp/ffmpeg.zip -d /tmp && \
    mv /tmp/ffmpeg /usr/local/bin/ffmpeg && \
    URL="https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v${FFMPEG_VERSION}/ffprobe-${FFMPEG_VERSION}-linux-${ARCH}.zip" && \
    wget $URL -O /tmp/ffprobe.zip && \
    unzip /tmp/ffprobe.zip -d /tmp && \
    mv /tmp/ffprobe /usr/local/bin/ffprobe && \
    rm -rf /tmp/ffmpeg.zip /tmp/ffprobe.zip

COPY ./apps/push-serverless/vm/usr/local/srs/conf/knzklive.conf /usr/local/srs/conf/knzklive.conf
COPY ./apps/push-serverless/vm/etc/nginx/conf.d/knzklive.conf /etc/nginx/conf.d/knzklive.conf
COPY ./apps/push-serverless/vm/etc/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./apps/push-serverless/vm/knzk/entry.sh /knzk/entry.sh
RUN chmod +x /knzk/entry.sh

COPY --from=builder /home/node/app/apps/push-serverless/dist /knzk/kernel

CMD ["/knzk/entry.sh"]
