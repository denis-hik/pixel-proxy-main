FROM node:alpine
WORKDIR /usr/src/app
COPY server-node/package.json ./package.json
RUN  yarn install
COPY server-node/server.js ./server.js
COPY server-node/modules ./modules
EXPOSE 9999
CMD [ "node", "server.js" ]