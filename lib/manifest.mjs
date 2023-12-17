const manifest = {
    "name": "utilitas",
    "description": "Just another common utility for JavaScript.",
    "version": "1995.2.29",
    "private": false,
    "homepage": "https://github.com/Leask/utilitas",
    "main": "index.mjs",
    "type": "module",
    "engines": {
        "node": ">=20.x"
    },
    "author": "Leask Wong <i@leaskh.com>",
    "license": "MIT",
    "repository": {
        "type": "git",
        "url": "https://github.com/Leask/utilitas.git"
    },
    "overrides": {
        "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.1/xlsx-0.20.1.tgz"
    },
    "dependencies": {
        "file-type": "^18.7.0",
        "mathjs": "^12.2.0",
        "uuid": "^9.0.1"
    },
    "devDependencies": {
        "@ffmpeg-installer/ffmpeg": "^1.1.0",
        "@ffprobe-installer/ffprobe": "^2.1.2",
        "@google-cloud/speech": "^6.1.0",
        "@google-cloud/storage": "^7.7.0",
        "@google-cloud/text-to-speech": "^5.0.1",
        "@google-cloud/vision": "^4.0.2",
        "@mozilla/readability": "^0.4.4",
        "@ngrok/ngrok": "^0.9.1",
        "@sentry/node": "^7.88.0",
        "@waylaidwanderer/chatgpt-api": "^1.37.3",
        "acme-client": "^5.0.0",
        "browserify-fs": "^1.0.0",
        "buffer": "^6.0.3",
        "fast-geoip": "^1.1.88",
        "fluent-ffmpeg": "^2.1.2",
        "form-data": "^4.0.0",
        "ioredis": "^5.3.2",
        "jsdom": "^23.0.1",
        "lorem-ipsum": "^2.0.8",
        "mailgun.js": "^9.4.0",
        "mailparser": "^3.6.5",
        "mime-types": "^2.1.35",
        "mysql2": "^3.6.5",
        "node-mailjet": "^6.0.5",
        "node-polyfill-webpack-plugin": "^3.0.0",
        "office-text-extractor": "^3.0.2",
        "openai": "^4.22.0",
        "pdfjs-dist": "^4.0.269",
        "pg": "^8.11.3",
        "pgvector": "^0.1.6",
        "ping": "^0.4.4",
        "say": "^0.16.0",
        "telegraf": "^4.15.3",
        "telesignsdk": "^2.2.3",
        "tesseract.js": "^5.0.3",
        "twilio": "^4.20.0",
        "url": "github:Leask/node-url",
        "webpack-cli": "^5.1.4",
        "whisper-node": "^1.1.1",
        "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.1/xlsx-0.20.1.tgz",
        "youtube-transcript": "^1.0.6"
    }
};

export default manifest;