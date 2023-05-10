FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm i
EXPOSE 3030
CMD ["npm", "start"]