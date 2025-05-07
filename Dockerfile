# Imagem base do Node
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

#Secret do JWT, pode ser qualquer um aleatorio
ENV ACCESS_TOKEN_SECRET="453cea9a52293cabb339cb9b86615dc691807126a2e84ec7b2ea2d9e7a3f25b32f02487dc86e40f4f8f207357a1a5a7704a48ab03d00cffbca5d5c58fdcc4483"
# Copia apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Exponha a porta do backend (ajustável, mas aqui é 3000)
EXPOSE 3000

# Comando de inicialização
CMD ["node", "app.js"]
