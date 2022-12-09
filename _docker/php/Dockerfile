FROM php:8.1-cli-alpine

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN chmod +x /usr/local/bin/install-php-extensions; \
    install-php-extensions  \
      gd \
    ;

RUN apk add --no-cache \
        bash \
    ;

ARG UID
RUN \
    adduser -D -s /bin/bash --uid ${UID} docker www-data; \
    curl -sSLf \
        -o /home/docker/.bashrc \
        https://gist.githubusercontent.com/babeuloula/3911e3192bdade918c26a43885f31a0a/raw/d37620f6e28606a0db0642687b57afc3acb45f48/.bashrc; \
    chown -R docker:docker /home/docker; \
    chown -R docker /var/www/html;
USER docker
