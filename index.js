const { Client, LocalAuth } = require('whatsapp-web.js');
const { Config } = require('./config.js');
var colors = require('colors');
var qrcode = require('qrcode-terminal');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Generate and scan this code with your phone 
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('remote_session_saved', () => {
    // Do Stuff...
    console.log('Session saved'.info);
});

client.on('ready', () => {
    console.log('Client is ready!'.info);
});

client.on('message_create', async msg => {
    console.log('Received a message: '.data, msg.body.info);
    if (!msg.hasMedia) {
        const parts = msg.body.split(" ");
        const command = (message) => {
            return Config.prefix.some((p) => parts[0].startsWith(p) && parts[0] === `${p}${message}`);
        };
        const args = parts.slice(1);
        if (command('ping')) {
            const start_time = Date.now();
            await msg.reply('Pong!');
            const end_time = Date.now();
            const ping_time = end_time - start_time;
            await msg.reply(`Ping: ${ping_time}ms`);
        } else if (command('say')) {
            await msg.reply(args[0]);
        }
    }
});

client.initialize();