import crypto from 'node:crypto';

// Kalshi auth: sign `${timestampMs}${METHOD}${path}` with RSA-PSS / SHA-256,
// salt length = digest length, base64-encoded. Headers go on the request
// (or the WebSocket upgrade request for ws://).
export function signRequest({ privateKey, method, path }) {
  const timestamp = Date.now().toString();
  const message = timestamp + method + path;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(message);
  signer.end();
  const signature = signer.sign(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    },
    'base64',
  );
  return { timestamp, signature };
}

export function buildAuthHeaders({ keyId, privateKey, method, path }) {
  const { timestamp, signature } = signRequest({ privateKey, method, path });
  return {
    'KALSHI-ACCESS-KEY': keyId,
    'KALSHI-ACCESS-SIGNATURE': signature,
    'KALSHI-ACCESS-TIMESTAMP': timestamp,
  };
}
