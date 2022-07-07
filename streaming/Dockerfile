FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

USER node
WORKDIR /usr/src/app

COPY --chown=node:node ./ ./
RUN yarn install && yarn build

FROM node:18-slim
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

USER node
WORKDIR /usr/src/app

COPY --chown=node:node ./*.json ./*.yml ./yarn.lock ./
COPY --chown=node:node ./support ./support
COPY --chown=node:node ./.yarn ./.yarn
RUN yarn workspaces focus --production

COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

ENTRYPOINT ["/tini", "--"]
CMD ["node", "./dist"]
