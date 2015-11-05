import net from 'net';
import Rx from 'rx';

const nickname = 'randalthorrrr';
const fullname = 'Rand AlThor';
const host = 'irc.freenode.net';
const port = 6667;

const client = net.connect({ host, port }, () => {
  console.log('Connected to server.');

  setNickname(nickname);
  setUser(nickname, fullname);

  setTimeout(() => {
    join('#some_channel');
  }, 10000);
});

client.on('end', () => {
  console.log('Disconnected from server.');
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
  pong(host)
});

function send(text) {
  console.log('--> ' + text);
  client.write(text);
}

function setNickname(nickname) {
  send(`NICK ${nickname}\r\n`);
}

function setUser(nickname, fullname) {
  send(`USER ${fullname} 0 * : ${nickname}\r\n`);
}

function join(channel) {
  send(`join ${channel}\r\n`);
}

function quit() {
  send('quit\r\n');
}

function pong(host) {
  send(`pong ${host}\r\n`);
}
