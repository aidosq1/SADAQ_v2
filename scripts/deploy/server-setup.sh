#!/bin/bash
set -e

# =============================================
# SADAQ - Server Initial Setup Script (Debian 12)
# =============================================
# Run as root: sudo bash server-setup.sh

echo "=========================================="
echo "SADAQ Server Setup for Debian 12"
echo "=========================================="

# Update system
apt-get update && apt-get upgrade -y

# Install required packages
apt-get install -y \
    curl \
    wget \
    git \
    htop \
    ufw \
    fail2ban \
    certbot

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Create application user
if ! id "sadaq" &>/dev/null; then
    useradd -m -s /bin/bash -G docker sadaq
    echo "User 'sadaq' created and added to docker group"
fi

# Create application directories
mkdir -p /opt/sadaq/{nginx/conf.d,certbot/{conf,www},backups,logs}
chown -R sadaq:sadaq /opt/sadaq

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Configure fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Create Docker network
docker network create sadaq_network 2>/dev/null || true

echo "=========================================="
echo "Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Generate SSH key for GitHub Actions:"
echo "   ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/github_actions"
echo ""
echo "2. Add public key to authorized_keys:"
echo "   cat ~/.ssh/github_actions.pub >> /home/sadaq/.ssh/authorized_keys"
echo ""
echo "3. Copy private key content for GitHub Secret:"
echo "   cat ~/.ssh/github_actions"
echo ""
echo "4. Create .env file in /opt/sadaq/"
echo ""
echo "5. Get SSL certificate:"
echo "   certbot certonly --standalone -d kazarchery.kz -d www.kazarchery.kz"
echo "   cp -r /etc/letsencrypt /opt/sadaq/certbot/conf/"
echo "=========================================="
