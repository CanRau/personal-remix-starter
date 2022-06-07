# BASE
FROM node:16-bullseye-slim as base

ARG COMMIT_SHA

# update linux deps
RUN apt-get update \
        && apt-get install -y -q openssl \
        # install deps needed for [skia-canvas](https://github.com/samizdatco/skia-canvas#running-in-docker)
        && apt-get install -y -q --no-install-recommends libfontconfig1 fontconfig

# DEPS - Install all node_modules, including dev dependencies
FROM base as deps

ARG COMMIT_SHA

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

ADD package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install

# PRODUCTION-DEPS - Setup production node_modules
FROM base as production-deps

ARG COMMIT_SHA

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --from=deps /home/node/app/node_modules /home/node/app/node_modules
COPY --from=deps /home/node/app/.yarn /home/node/app/.yarn
ADD package.json yarn.lock .yarnrc.yml /home/node/app/

RUN yarn workspaces focus --all --production

# BUILD the app
FROM base as build

ARG COMMIT_SHA

ENV NODE_ENV=production

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node

COPY --from=deps --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
ADD --chown=node:node . .

RUN yarn build

# Finally, build the production image with minimal footprint
FROM base
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

ENV NODE_ENV=production
ENV OS_ENV=container

COPY --chown=node:node --from=production-deps /home/node/app/node_modules /home/node/app/node_modules
COPY --chown=node:node --from=build /home/node/app/build /home/node/app/build
COPY --chown=node:node --from=build /home/node/app/public /home/node/app/public
ADD --chown=node:node . .

USER node

CMD ["./node_modules/.bin/remix-serve", "build"]