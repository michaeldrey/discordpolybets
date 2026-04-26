import { config } from './config.js';
import { log } from './logger.js';

const SIDE_COLORS = {
  yes: 0x22c55e,
  no: 0xef4444,
};

function formatUsd(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export async function postWhaleAlert(trade) {
  const color = SIDE_COLORS[trade.side] ?? 0x9ca3af;
  const embed = {
    title: `Whale trade — ${trade.ticker}`,
    url: `https://kalshi.com/markets/${trade.ticker}`,
    color,
    fields: [
      { name: 'Side', value: trade.side.toUpperCase(), inline: true },
      { name: 'Price', value: `${trade.priceCents}¢`, inline: true },
      { name: 'Contracts', value: trade.count.toLocaleString('en-US'), inline: true },
      { name: 'Notional', value: formatUsd(trade.notionalUsd), inline: true },
    ],
    timestamp: new Date(trade.tsMs).toISOString(),
    footer: { text: `trade ${trade.tradeId}` },
  };

  const res = await fetch(config.discord.webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    log.error({ status: res.status, body }, 'discord webhook failed');
  }
}
