const fs = require('fs');

const jsonFile = fs.readFileSync('./firebase-admins-key.json');
const base64Key = Buffer.from(jsonFile).toString('base64');
