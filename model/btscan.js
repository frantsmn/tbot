var noble = require('noble');

noble.startScanning();

noble.on('discover', function (peripheral) {

    var macAddress = peripheral.uuid;
    var rss = peripheral.rssi;
    var localName = peripheral.localName || 'no local name';
    console.log('found device: ', macAddress, localName, rss);

});