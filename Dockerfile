FROM node:6.17.1

COPY . /voyager

RUN cd voyager && yarn && yarn build

WORKDIR /voyager

EXPOSE 9000

CMD ["yarn", "start:headless"]