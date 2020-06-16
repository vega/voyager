FROM node:9.11.2

COPY . /voyager

RUN cd voyager && yarn && yarn build

WORKDIR /voyager

EXPOSE 9000

CMD ["yarn", "start"]