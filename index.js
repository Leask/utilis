'use strict';

module.exports = {
    // dependencies
    base64url: require('base64url'),
    colors: require('colors/safe'),
    fetch: require('node-fetch'),
    geoIp: require('fast-geoip'),
    jwt: require('jsonwebtoken'),
    mailgun: require('mailgun-js'),
    mailjet: require('node-mailjet'),
    math: require('mathjs'),
    mysql: require('mysql2/promise'),
    ping: require('ping'),
    publicIp: require('public-ip'),
    qs: require('qs'),
    redis: require('ioredis'),
    sentry: require('@sentry/node'),
    telesign: require('telesignsdk'),
    twilio: require('twilio'),
    uuid: require('uuid'),
    winston: require('winston'),
    winstonPapertrail: require('winston-papertrail-mproved'),
    // features
    cache: require('./lib/cache'),
    dbio: require('./lib/dbio'),
    email: require('./lib/email'),
    encryption: require('./lib/encryption'),
    event: require('./lib/event'),
    network: require('./lib/network'),
    sentinel: require('./lib/sentinel'),
    shell: require('./lib/shell'),
    shot: require('./lib/shot'),
    sms: require('./lib/sms'),
    storage: require('./lib/storage'),
    tape: require('./lib/tape'),
    uoid: require('./lib/uoid'),
    utilitas: require('./lib/utilitas'),
};
