// Connects to the Kalshi WebSocket, subscribes to trades, prints the first
// few raw messages, then exits. Use this to verify your Kalshi credentials
// and endpoint URL before running the full bot.
//
// Requires KALSHI_KEY_ID, KALSHI_PRIVATE_KEY_PATH, KALSHI_WS_URL in .env.
// Discord webhook NOT needed.
// Run: node scripts/kalshi-ping.js
import 'dotenv/config';
import fs from 'node:fs';
import WebSocket from 'ws';
import { buildAuthHeaders } from '../src/kalshi/auth.js';

const keyId = process.env.KALSHI_KEY_ID;
const keyPath = process.env.KALSHI_PRIVATE_KEY_PATH;
const wsUrl = process.env.KALSHI_WS_URL;

if (!keyId || keyId === 'replace-me') exit('KALSHI_KEY_ID not set');
if (!keyPath) exit('KALSHI_PRIVATE_KEY_PATH not set');
if (!fs.existsSync(keyPath)) exit(`Private key file not found: ${keyPath}`);
if (!wsUrl) exit('KALSHI_WS_URL not set');

const privateKey = fs.readFileSync(keyPath, 'utf8');
const headers = buildAuthHeaders({
  keyId,
  privateKey,
  method: 'GET',
  path: '/trade-api/ws/v2',
});

console.log(`Connecting to ${wsUrl} ...`);
const ws = new WebSocket(wsUrl, { headers });

const MAX_MESSAGES = 5;
let received = 0;

ws.on('open', () => {
  console.log('OPEN — subscribing to trades');
  ws.send(JSON.stringify({ id: 1, cmd: 'subscribe', params: { channels: ['trade'] } }));
});

ws.on('message', (raw) => {
  received++;
  console.log(`[msg ${received}]`, raw.toString().slice(0, 400));
  if (received >= MAX_MESSAGES) {
    console.log('Got expected messages — auth works. Closing.');
    ws.close();
    process.exit(0);
  }
});

ws.on('close', (code, reason) => {
  console.log(`CLOSE ${code} ${reason.toString()}`);
  if (received === 0) process.exit(1);
});

ws.on('error', (err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});

setTimeout(() => {
  if (received === 0) {
    console.error('No messages within 30s. Likely auth or URL issue.');
    process.exit(1);
  }
}, 30_000);

function exit(msg) {
  console.error(msg);
  process.exit(1);
}
