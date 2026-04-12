# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./

# Instalar dependências COM verbose para debug
RUN npm install 

# Copiar código fonte
COPY . .

# Debug: Listar o que foi copiado
RUN ls -la src/ && ls -la *.json

# Build com verbose
RUN npm run build 2>&1 | tee build.log || (cat build.log && exit 1)

# Stage 2: Serve com nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
