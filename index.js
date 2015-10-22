import net from 'net';
import Rx from 'rx';

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

const client$ = Rx.Observable.fromEvent(client, 'data')
  .map(data => data.toString());

const brokenLines = () => {
  let previousLastLine = "";
  return line => {
    const lines = (previousLastLine + line).split('\n');
    previousLastLine = lines[lines.length - 1];
    return lines.slice(0, -1);
  }
}
const line$ = client$
  .flatMap(brokenLines());

const ping$ = line$
  .filter(line => line.match('^PING'))
  .map(line => line.split(' ')[1]);

line$.subscribe(line => {
  console.log('<--', line);
});

ping$.subscribe(host => {
  send(`pong ${host}\r\n`);
});

client.on('end', () => {
  console.log('Disconnected from server.');
});

function send(text) {
  console.log('--> ' + text);
  client.write(text);
}
