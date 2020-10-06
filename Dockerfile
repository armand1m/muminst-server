FROM node:10-alpine AS builder
RUN apk add --no-cache build-base python3 opus 
WORKDIR /app
COPY . .
RUN yarn --production
RUN yarn build

FROM node:10-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S muminst -u 1001
USER muminst
EXPOSE 4000

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build 

ENTRYPOINT ["node"]
CMD ["/app/build/main.js"] 
