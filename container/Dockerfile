FROM node:latest
WORKDIR /app
COPY . .
EXPOSE 3000
RUN npm install -g pnpm
RUN pnpm install
CMD ["sh", "-c", "npx prisma db push && pnpm run dev"]