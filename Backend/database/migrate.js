const fs = require('node:fs');
const path = require('node:path');
const db = require('../db');
db.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
 .then(() => console.log('PostgreSQL schema is ready.'))
 .catch(error => { console.error(error); process.exitCode = 1; })
 .finally(() => db.end());
