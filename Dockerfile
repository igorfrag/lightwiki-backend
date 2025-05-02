# Imagem base do Node
FROM node:20

# Define o diretório de trabalho dentro do container
WORKDIR /app

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
