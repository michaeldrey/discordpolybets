// Sends a fake whale-trade alert to your Discord webhook.
// Use this to verify the webhook works without waiting for a real $10k trade.
//
// Requires DISCORD_WEBHOOK_URL in .env (Kalshi creds NOT needed).
// Run: node scripts/test-discord.js
import 'dotenv/config';

const url = process.env.DISCORD_WEBHOOK_URL;
if (!url || url.includes('REPLACE/ME')) {
  console.error('DISCORD_WEBHOOK_URL not set in .env');
  process.exit(1);
}

const fake = {
  ticker: 'KXTEST-DEMO',
  side: 'yes',
  priceCents: 67,
  count: 20_000,
  notionalUsd: 13_400,
  tsMs: Date.now(),
  tradeId: 'test-' + Math.random().toString(36).slice(2, 10),
};

const embed = {
  title: `Whale trade — ${fake.ticker}`,
  url: `https://kalshi.com/markets/${fake.ticker}`,
  color: 0x22c55e,
  fields: [
    { name: 'Side', value: fake.side.toUpperCase(), inline: true },
    { name: 'Price', value: `${fake.priceCents}¢`, inline: true },
    { name: 'Contracts', value: fake.count.toLocaleString('en-US'), inline: true },
    { name: 'Notional', value: `$${fake.notionalUsd.toLocaleString('en-US')}`, inline: true },
  ],
  timestamp: new Date(fake.tsMs).toISOString(),
  footer: { text: `TEST alert — trade ${fake.tradeId}` },
};

const res = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ embeds: [embed] }),
});

if (res.ok) {
  console.log('OK — check your Discord channel for a green TEST whale alert.');
} else {
  console.error(`Discord responded ${res.status}:`, await res.text());
  process.exit(1);
}
