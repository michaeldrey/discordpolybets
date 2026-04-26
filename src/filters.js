// Kalshi trade msg shape:
// { trade_id, ticker, count, yes_price, no_price, taker_side, ts }
// Prices are integers in cents (1-99). Notional in USD = count * priceCents / 100.
export function toWhaleTrade(raw) {
  const side = raw.taker_side;
  const priceCents = side === 'yes' ? raw.yes_price : raw.no_price;
  const notionalUsd = (raw.count * priceCents) / 100;
  return {
    tradeId: raw.trade_id,
    ticker: raw.ticker,
    side,
    priceCents,
    count: raw.count,
    notionalUsd,
    tsMs: (raw.ts ?? Math.floor(Date.now() / 1000)) * 1000,
  };
}

export function isWhale(trade, thresholdUsd) {
  return trade.notionalUsd >= thresholdUsd;
}
