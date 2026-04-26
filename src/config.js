import 'dotenv/config';
import fs from 'node:fs';

function required(name) {
  const v = process.env[name];
  if (!v || v.startsWith('replace-me') || v.includes('REPLACE/ME')) {
    throw new Error(`Missing or placeholder env var: ${name}`);
  }
  return v;
}

const privateKeyPath = required('KALSHI_PRIVATE_KEY_PATH');
if (!fs.existsSync(privateKeyPath)) {
  throw new Error(`Kalshi private key not found at ${privateKeyPath}`);
}

export const config = {
  kalshi: {
    keyId: required('KALSHI_KEY_ID'),
    privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
    wsUrl: required('KALSHI_WS_URL'),
    restUrl: required('KALSHI_REST_URL'),
  },
  discord: {
    webhookUrl: required('DISCORD_WEBHOOK_URL'),
  },
  whaleThresholdUsd: Number(process.env.WHALE_THRESHOLD_USD ?? 10000),
  logLevel: process.env.LOG_LEVEL ?? 'info',
};
