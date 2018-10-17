FROM node:4-alpine

RUN apk update && \
  apk add --no-cache git

WORKDIR /shield

COPY . /shield

RUN npm link

CMD test/test.sh
