FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${REACT_APP_PORT}

CMD ["npm", "start"] 