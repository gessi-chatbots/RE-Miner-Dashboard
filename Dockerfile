FROM node:18-alpine

WORKDIR /RE-Miner-Dashboard

COPY public/ /RE-Miner-Dashboard/public
COPY src/ /RE-Miner-Dashboard/src
COPY package.json /RE-Miner-Dashboard/

EXPOSE 8000

RUN npm install

CMD ["npm", "start", "--", "--port", "8000"]
