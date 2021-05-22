const arpScanner = require('arpscan');

function checkDevice() {
    return new Promise((resolve, reject) => {

        if (process.platform !== "linux") return;

        console.log('[scan] Checking device...');

        arpScanner(onResult, { args: ['-l', '-v'] });

        function onResult(err, data) {
            if (err) {
                console.log(error)
                reject();
            };

            // console.log(data)
            if (data.length || data.some(device => device.mac === 'A0:28:ED:80:6F:12')) {
                console.log('Создатель дома');
                resolve(true);
            } else {
                console.log('Телефон не найден');
                resolve(false);
            }
        }

    })
}

exports.checkDevice = checkDevice;
