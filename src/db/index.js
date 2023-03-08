const Keyv = require('keyv');

const servers = new Keyv('sqlite://./src/db/db.sqlite', {
    table: 'servers',
});

const chat = new Keyv('sqlite://./src/db/db.sqlite', {
    table: 'chat',
});

const gptSettings = new Keyv('sqlite://./src/db/db.sqlite', {
    table: 'gptsettings',
});

servers.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
    servers,
    chat,
    gptSettings,
};
