.SILENT: php js

build_php:
	docker build -t code-golf-php --build-arg UID=$(shell id -u) -f _docker/php/Dockerfile .

php: build_php
	docker run \
		--rm \
		--tty --interactive \
		--name code_golf_php \
 		-v "$(shell pwd)":/var/www/html \
 		-w /var/www/html \
 		code-golf-php bash

build_js:
	docker build -t code-golf-js --build-arg UID=$(shell id -u) -f _docker/js/Dockerfile .

js: build_js
	docker run \
		--rm \
		--tty --interactive \
		--name code_golf_js \
 		-v "$(shell pwd)":/home/docker/app \
 		-w /home/docker/app \
 		code-golf-js bash
