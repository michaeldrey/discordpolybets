#!/usr/bin/env bash
# One-time droplet setup for the Kalshi whale alerter.
# Tested target: Ubuntu 24.04 LTS, DigitalOcean $6/mo droplet (1 vCPU / 1 GB).
#
# Run as root on a fresh droplet:
#   ssh root@<droplet-ip>
#   curl -fsSL https://raw.githubusercontent.com/<you>/<repo>/<branch>/scripts/bootstrap.sh | bash
# or
#   scp scripts/bootstrap.sh root@<ip>:/root/ && ssh root@<ip> bash bootstrap.sh
#
# Then deploy the app:
#   git clone <repo-url> /opt/whale-alerter
#   cd /opt/whale-alerter
#   npm ci --omit=dev
#   cp .env.example .env && nano .env             # fill in real values
#   # paste your kalshi.pem private key into /opt/whale-alerter/kalshi.pem
#   chmod 600 .env kalshi.pem
#   pm2 start ecosystem.config.cjs
#   pm2 save
#   pm2 startup systemd                            # then run the sudo line it prints
#
# Logs:           pm2 logs whale-alerter
# Restart:        pm2 restart whale-alerter
# Stop:           pm2 stop whale-alerter

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root (or with sudo)." >&2
  exit 1
fi

echo "==> apt update + base packages"
apt-get update
apt-get install -y curl ca-certificates git ufw

echo "==> firewall: ssh only"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw --force enable

echo "==> Node 20 (NodeSource)"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20.* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> pm2"
npm install -g pm2

echo "==> /opt/whale-alerter"
mkdir -p /opt/whale-alerter

echo
echo "Bootstrap done. Next:"
echo "  git clone <repo-url> /opt/whale-alerter"
echo "  cd /opt/whale-alerter && npm ci --omit=dev"
echo "  cp .env.example .env && nano .env"
echo "  # put your kalshi.pem in /opt/whale-alerter/kalshi.pem (chmod 600)"
echo "  pm2 start ecosystem.config.cjs && pm2 save && pm2 startup systemd"
