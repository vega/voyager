FROM node:14.4.0

COPY . /voyager

RUN cd voyager && yarn && yarn build

WORKDIR /voyager

EXPOSE 9000

CMD ["yarn", "start:headless"]