FROM node:latest
WORKDIR /app
EXPOSE 3000
RUN npm install -g pnpm
RUN pnpm install
COPY . .
CMD ["sh", "-c", "npx prisma db push && pnpm run dev"]