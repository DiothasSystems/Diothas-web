#!/usr/bin/env node
/**
 * Local preview only. Hostinger serves dist/ as plain files — this server
 * is never deployed. Its one job is to let you see the built site the way a
 * static host will, including directory indexes and the 404 page.
 *
 *   npm run preview   # build, then serve
 */
'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');

const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(__dirname, 'dist');
const PORT = process.env.PORT || 8080;

if (!fs.existsSync(DIST)) {
  console.error('  dist/ does not exist. Run `npm run build` first.');
  process.exit(1);
}

const app = express();
app.use(express.static(DIST, { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile(path.join(DIST, '404.html')));

app.listen(PORT, () => console.log(`  Diothas Systems preview → http://localhost:${PORT}`));
