FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
RUN pnpm install --filter @mypg/api...
COPY packages/api ./packages/api
WORKDIR /app/packages/api
RUN pnpm build
EXPOSE 4000
CMD ["node", "dist/index.js"]
