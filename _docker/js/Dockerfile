FROM node:18-bullseye

RUN npm install -g npm@8.9.0

ARG UID
RUN \
    userdel -f -r node; \
    useradd -ms /bin/bash --uid ${UID} docker; \
    usermod -a -G docker docker; \
    curl -sSLf \
        -o /home/docker/.bashrc \
        https://gist.githubusercontent.com/babeuloula/3911e3192bdade918c26a43885f31a0a/raw/d37620f6e28606a0db0642687b57afc3acb45f48/.bashrc; \
    mkdir /home/docker/app; \
    chown -R docker:docker /home/docker;
USER docker

WORKDIR /home/docker/app
