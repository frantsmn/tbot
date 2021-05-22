const arpScanner = require('arpscan');

exports.checkDevice = function (){
    if (process.platform !== "linux") return;
    return new Promise((resolve, reject) => {

        console.log('[scan.js] Checking device...');

        arpScanner(onResult, { args: ['-l', '-v'] });

        function onResult(error, data) {
            if (error && error !== 1) {
                console.log(error)
                reject();
            };

            // console.log(data)
            if (data !== null && data.some(device => device.mac === 'A0:28:ED:80:6F:12')) {
                console.log('[scan.js] Device at home!');
                resolve(true);
            } else {
                console.log('[scan.js] Device not found');
                resolve(false);
            }
        }

    })
}