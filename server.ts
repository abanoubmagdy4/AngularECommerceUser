import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { APP_BASE_HREF } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './src/app/app';
import { config } from './src/app/app.config.server';

const server = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, '../browser/index.html');

server.set('view engine', 'html');
server.set('views', browserDistFolder);

server.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));

server.get('*', (req, res) => {
  res.sendFile(indexHtml);
});

const port = process.env['PORT'] || 4000;

server.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
