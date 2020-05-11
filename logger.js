const fs = require('fs');

exports.log = str => {
    const msg = `${new Date(Date.now()).toLocaleTimeString()} ${str}`;
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.appendFileSync(`./logs/${new Date(Date.now()).toLocaleDateString()}.log`, `${msg}\n`);
    console.log(msg);
}

exports.error = str => {
    const time = new Date(Date.now()).toLocaleTimeString();
    const msg = `${time} 🟥${str}`;

    const consoleMsg = time + ' \033[91m🟥  ' + str + '\x1b[0m';
    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.appendFileSync(`./logs/${new Date(Date.now()).toLocaleDateString()}.log`, `${msg}\n`);
    console.error(consoleMsg);
}