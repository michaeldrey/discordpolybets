import WebSocket from 'ws';
import { buildAuthHeaders } from './auth.js';
import { log } from '../logger.js';

const WS_PATH = '/trade-api/ws/v2';

export function connectKalshi({ wsUrl, keyId, privateKey, onTrade }) {
  let ws;
  let reconnectDelayMs = 1000;
  const maxDelayMs = 30_000;
  let nextSubId = 1;
  let stopped = false;
  let pingTimer;

  function open() {
    const headers = buildAuthHeaders({
      keyId,
      privateKey,
      method: 'GET',
      path: WS_PATH,
    });
    log.info({ wsUrl }, 'connecting to kalshi ws');
    ws = new WebSocket(wsUrl, { headers });

    ws.on('open', () => {
      reconnectDelayMs = 1000;
      log.info('kalshi ws open, subscribing to trades channel');
      ws.send(
        JSON.stringify({
          id: nextSubId++,
          cmd: 'subscribe',
          params: { channels: ['trade'] },
        }),
      );
      pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.ping();
      }, 30_000);
    });

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (msg.type === 'trade' && msg.msg) {
        try {
          onTrade(msg.msg);
        } catch (err) {
          log.error({ err: err.message }, 'trade handler threw');
        }
      } else if (msg.type === 'subscribed') {
        log.info({ msg }, 'subscribed');
      } else if (msg.type === 'error') {
        log.error({ msg }, 'kalshi ws error message');
      }
    });

    ws.on('close', (code, reason) => {
      clearInterval(pingTimer);
      log.warn({ code, reason: reason.toString() }, 'kalshi ws closed');
      if (!stopped) scheduleReconnect();
    });

    ws.on('error', (err) => {
      log.error({ err: err.message }, 'kalshi ws error');
    });
  }

  function scheduleReconnect() {
    const delay = reconnectDelayMs;
    reconnectDelayMs = Math.min(reconnectDelayMs * 2, maxDelayMs);
    log.info({ delayMs: delay }, 'reconnecting');
    setTimeout(open, delay);
  }

  open();

  return {
    stop() {
      stopped = true;
      clearInterval(pingTimer);
      if (ws) ws.close();
    },
  };
}
