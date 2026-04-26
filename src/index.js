import { config } from './config.js';
import { log } from './logger.js';
import { connectKalshi } from './kalshi/ws.js';
import { toWhaleTrade, isWhale } from './filters.js';
import { LruSet } from './dedupe.js';
import { postWhaleAlert } from './discord.js';

const seen = new LruSet(10_000);

const client = connectKalshi({
  wsUrl: config.kalshi.wsUrl,
  keyId: config.kalshi.keyId,
  privateKey: config.kalshi.privateKey,
  onTrade: async (raw) => {
    const trade = toWhaleTrade(raw);
    if (!isWhale(trade, config.whaleThresholdUsd)) return;
    if (!seen.add(trade.tradeId)) return;
    log.info({ trade }, 'whale trade detected');
    try {
      await postWhaleAlert(trade);
    } catch (err) {
      log.error({ err: err.message }, 'failed to post discord alert');
    }
  },
});

function shutdown(signal) {
  log.info({ signal }, 'shutting down');
  client.stop();
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

log.info({ thresholdUsd: config.whaleThresholdUsd }, 'whale alerter started');
