FROM node:12-alpine AS builder
RUN apk add --no-cache build-base python3 opus git
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:12-alpine
RUN apk add --no-cache ffmpeg
RUN addgroup -g 1001 -S nodejs
RUN adduser -S muminst -u 1001
USER muminst
EXPOSE 4000

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build 

ENTRYPOINT ["node"]
CMD ["/app/build/main.js"] 
