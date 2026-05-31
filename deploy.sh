 #!/bin/bash
# deploy.sh — Run this on the server to deploy wms.zeveph.com
# Usage: bash deploy.sh
set -e

APP_DIR="/var/www/Task-Management-System"
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO.git"  # <-- update this

echo "==> Deploying Work Management System to wms.zeveph.com"

# ── 1. Pull latest code ──────────────────────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  echo "==> Pulling latest code..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "==> Cloning repository..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 2. Backend: install dependencies ────────────────────────────────────────
echo "==> Installing backend dependencies..."
cd "$APP_DIR/backend"

if [ ! -f ".env" ]; then
  echo "==> WARNING: backend/.env not found!"
  echo "    Copy .env.example to .env and fill in your values, then re-run."
  cp .env.example .env
  echo "    Edit $APP_DIR/backend/.env now, then run: bash $APP_DIR/deploy.sh"
  exit 1
fi

npm install --omit=dev

# ── 3. Frontend: install deps + build ───────────────────────────────────────
echo "==> Building frontend..."
cd "$APP_DIR/frontend"
npm install
npm run build

# ── 4. Database: run migrations ─────────────────────────────────────────────
echo "==> Running database setup / migrations..."
cd "$APP_DIR/backend"
node setup-db.js || echo "  (setup-db.js already ran or skipped)"

# ── 5. Start / reload with PM2 ──────────────────────────────────────────────
echo "==> Starting app with PM2..."
cd "$APP_DIR"

if pm2 list | grep -q "wms-backend"; then
  pm2 reload ecosystem.config.js --env production
else
  pm2 start ecosystem.config.js --env production
  pm2 save
  pm2 startup   # follow the printed command to enable auto-start on reboot
fi

# ── 6. Apache config ────────────────────────────────────────────────────────
# Enable required modules (safe to run multiple times)
sudo a2enmod proxy proxy_http headers rewrite 2>/dev/null || true

if [ ! -f "/etc/apache2/sites-enabled/wms.zeveph.com.conf" ]; then
  echo "==> Installing Apache config..."
  sudo cp "$APP_DIR/nginx/wms.zeveph.com.conf" /etc/apache2/sites-available/wms.zeveph.com.conf
  sudo a2ensite wms.zeveph.com.conf
  sudo apache2ctl configtest && sudo systemctl reload apache2
  echo ""
  echo "==> Obtain SSL cert with Certbot:"
  echo "    sudo certbot --apache -d wms.zeveph.com"
else
  sudo apache2ctl configtest && sudo systemctl reload apache2
fi

echo ""
echo "✅  Deployment complete! Visit https://wms.zeveph.com"
