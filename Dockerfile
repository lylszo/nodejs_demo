FROM node:13.12.0-slim
ADD . /home/baiyi-node
WORKDIR /home/baiyi-node
RUN npm install && npm install pm2 -g
EXPOSE 555
CMD [ "pm2-runtime", "app.js" ]