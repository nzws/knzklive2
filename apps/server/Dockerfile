FROM node:20-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./yarn.lock ./package.json ./.yarnrc.yml ./
COPY --chown=node:node ./apps/server ./apps/server
COPY --chown=node:node ./.yarn ./.yarn
COPY --chown=node:node ./packages/api-types ./packages/api-types

RUN yarn workspaces focus server api-types && yarn workspace api-types build && yarn workspace server build

FROM node:20-slim
RUN apt-get update &&\
  apt-get install -y ca-certificates gnupg openssl libssl-dev libc6 &&\
  apt-get clean &&\
  rm -rf /var/lib/apt/lists/*

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ./*.json ./*.yml ./yarn.lock ./
COPY --chown=node:node ./.yarn ./.yarn
COPY --chown=node:node ./apps/server/prisma ./apps/server/prisma
COPY --chown=node:node ./apps/server/*.json ./apps/server/
COPY --chown=node:node ./packages/api-types ./packages/api-types
RUN yarn workspaces focus server --production

COPY --chown=node:node --from=builder /home/node/app/packages/api-types ./packages/api-types
COPY --chown=node:node --from=builder /home/node/app/apps/server/dist ./apps/server/dist
COPY --chown=node:node --from=builder /home/node/app/node_modules/.prisma/client ./node_modules/.prisma/client

CMD ["node", "apps/server/dist"]
