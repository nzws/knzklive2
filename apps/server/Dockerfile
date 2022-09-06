FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ../../yarn.lock ../../package.json ../../.yarnrc.yml ./
COPY --chown=node:node ./ ./packages/server
COPY --chown=node:node ../../.yarn ./.yarn

RUN yarn workspaces focus server && yarn workspace server build

FROM node:18-slim
RUN apt-get update && apt-get install -y ca-certificates gnupg openssl libssl-dev libc6

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ../../*.json ../../*.yml ../../yarn.lock ./
COPY --chown=node:node ../../.yarnv ./.yarn
COPY --chown=node:node ./prisma ./packages/server/prisma
COPY --chown=node:node ./*.json ./packages/server/
RUN yarn workspaces focus server --production

COPY --chown=node:node --from=builder /home/node/app/packages/server/dist ./packages/server/dist
COPY --chown=node:node --from=builder /home/node/app/node_modules/.prisma/client ./node_modules/.prisma/client

CMD ["node", "packages/server/dist"]
