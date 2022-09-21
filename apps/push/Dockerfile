FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./yarn.lock ./package.json ./.yarnrc.yml ./
COPY --chown=node:node ./apps/push ./apps/push
COPY --chown=node:node ./.yarn ./.yarn
COPY --chown=node:node ./packages/api-types ./packages/api-types

RUN yarn workspaces focus push api-types && yarn workspace api-types build && yarn workspace push build

FROM node:18-slim
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6
# RUN apt-get install -y curl

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./*.json ./*.yml ./yarn.lock ./
COPY --chown=node:node ./.yarn ./.yarn
COPY --chown=node:node ./apps/push/*.json ./apps/push/
COPY --chown=node:node ./packages/api-types ./packages/api-types
RUN yarn workspaces focus push --production

COPY --chown=node:node --from=builder /home/node/app/packages/api-types ./packages/api-types
COPY --chown=node:node --from=builder /home/node/app/apps/push/dist ./apps/push/dist

CMD ["node", "apps/push/dist"]
