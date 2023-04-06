FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./yarn.lock ./package.json ./.yarnrc.yml ./
COPY --chown=node:node ./apps/video ./apps/video
COPY --chown=node:node ./.yarn ./.yarn
COPY --chown=node:node ./packages/api-types ./packages/api-types

RUN yarn workspaces focus video api-types && yarn workspace api-types build && yarn workspace video build

FROM node:18-slim
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6
# RUN apt-get install -y curl

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./*.json ./*.yml ./yarn.lock ./
COPY --chown=node:node ./.yarn ./.yarn
COPY --chown=node:node ./apps/video/*.json ./apps/video/
COPY --chown=node:node ./packages/api-types ./packages/api-types
RUN yarn workspaces focus video --production

COPY --chown=node:node --from=builder /home/node/app/packages/api-types ./packages/api-types
COPY --chown=node:node --from=builder /home/node/app/apps/video/dist ./apps/video/dist

CMD ["node", "apps/video/dist"]
