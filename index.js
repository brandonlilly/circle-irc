import net from 'net';

const nickname = 'randalthorrrr';
const fullname = 'Rand AlThor';

const client = net.connect({ host: 'irc.freenode.net', port: 6667 }, () => {
  console.log('Connected to server.');

  send(`NICK ${nickname}\r\n`);
  send(`USER ${nickname} 0 * : ${fullname}\r\n`);

  setTimeout(() => {
    // send('quit\r\n');
    send('join #kaias\r\n');
  }, 10000);
});

let stream = '';

client.on('data', (data) => {
  // console.log('<--', data.toString());
  stream = stream + data.toString();
  let idx;
  while (stream.indexOf('\r\n') !== -1) {
    idx = stream.indexOf('\r\n');
    handle(stream.substr(0, idx).trim());
    stream = stream.substr(idx + 1);
  }
  // client.end();
});

client.on('end', () => {
  console.log('Disconnected from server.');
});

function send(text) {
  console.log('--> ' + text);
  client.write(text);
}

function handle(data) {
  console.log('<-- ', data);

  const [a, b] = data.split(' ');
  if (data.match('^PING')) {
    send('pong ' + b + '\r\n');
  }
}
