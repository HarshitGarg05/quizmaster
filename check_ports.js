const net = require('net');
const hosts = [
    'ac-leafmic-shard-00-00.lhlqdhs.mongodb.net',
    'ac-leafmic-shard-00-01.lhlqdhs.mongodb.net',
    'ac-leafmic-shard-00-02.lhlqdhs.mongodb.net'
];

hosts.forEach(host => {
    const client = new net.Socket();
    client.setTimeout(2000);
    client.connect(27017, host, () => {
        console.log(`SUCCESS: ${host} is REACHABLE`);
        client.destroy();
    });
    client.on('error', (err) => {
        console.error(`FAILURE: ${host} is UNREACHABLE: ${err.message}`);
    });
    client.on('timeout', () => {
        console.error(`FAILURE: ${host} TIMED OUT`);
        client.destroy();
    });
});
