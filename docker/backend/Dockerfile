FROM php:8.4-fpm

ARG LOCAL_UID=1000
ARG LOCAL_GID=1000

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-mysql-client \
        git \
        libicu-dev \
        libonig-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install \
        bcmath \
        intl \
        mbstring \
        pcntl \
        pdo_mysql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY docker/backend/php.ini /usr/local/etc/php/conf.d/app.ini

RUN groupmod -o -g "${LOCAL_GID}" www-data \
    && usermod -o -u "${LOCAL_UID}" -g "${LOCAL_GID}" www-data

WORKDIR /var/www/html

USER www-data

CMD ["php-fpm"]
