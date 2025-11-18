FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install -g expo-cli && npm install
RUN npm install -g expo-cli @expo/ngrok
COPY . .
EXPOSE 8081
CMD ["npx", "expo", "start", "--tunnel"]
