FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@9
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/dashboard/package.json ./packages/dashboard/
RUN pnpm install --filter @mypg/dashboard...
COPY packages/dashboard ./packages/dashboard
WORKDIR /app/packages/dashboard
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
