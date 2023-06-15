FROM node:18.16.0
WORKDIR /app
COPY . .
RUN npm i
EXPOSE 3030
EXPOSE 3000
CMD ["npm", "start"]