const fs = require('fs');
const colorLog = require('node-color-log');

function makeRecord(prefix, str) {
    const rawDate = new Date();
    const time = rawDate.toLocaleTimeString();
    const date = rawDate.toLocaleDateString();
    const record = `${time} | ${prefix} | ${str}`;
    const message = `${time} | ${str}`;

    if (!fs.existsSync('./logs'))
        fs.mkdirSync('./logs');
    fs.appendFileSync(`./logs/${date}.log`, `${record}\n`);

    switch (prefix) {

        case 'log':
            colorLog
                .color('white')
                .log(message);
            return;

        case 'info':
            colorLog
                .color('blue')
                .log(message);
            return;

        case 'warning':
            colorLog
                .color('yellow')
                .log(message);
            return;

        case 'error':
            colorLog
                .color('red')
                .bold()
                .log(message);
            return;
            
    }
}

exports.log = (str) => makeRecord('log', str);
exports.info = (str) => makeRecord('info', str);
exports.warning = (str) => makeRecord('warning', str);
exports.error = (str) => makeRecord('error', str);