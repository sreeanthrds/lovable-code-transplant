#!/bin/bash

echo "🔧 EXACT VM Installation - Match Local Environment"
echo "================================================="

echo ""
echo "📋 Local Environment (What We Need to Match):"
echo "  Node.js: v20.17.0"
echo "  npm: 10.8.2"
echo "  Python: 3.12.3"

echo ""
echo "🔧 Step 1: Install EXACT Node.js v20.17.0"
echo "-----------------------------------------"
echo "⚠️  IMPORTANT: Don't use 'latest' - use specific version!"

# Remove any existing Node.js
sudo apt-get remove -y nodejs npm
sudo apt-get autoremove -y

# Add NodeSource repository for specific version
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Install EXACT Node.js v20.17.0 using nvm (more precise)
echo "🔄 Installing nvm for precise version control..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install EXACT versions
echo "📦 Installing Node.js v20.17.0..."
nvm install 20.17.0
nvm use 20.17.0
nvm alias default 20.17.0

echo "📦 Installing npm 10.8.2..."
npm install -g npm@10.8.2

echo ""
echo "🔧 Step 2: Install EXACT Python 3.12.3"
echo "----------------------------------------"
echo "⚠️  IMPORTANT: Don't use system Python - use specific version!"

# Install pyenv for precise Python version control
echo "🔄 Installing pyenv for precise version control..."
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev

# Install pyenv
curl https://pyenv.run | bash
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Install EXACT Python 3.12.3
echo "📦 Installing Python 3.12.3..."
pyenv install 3.12.3
pyenv global 3.12.3

echo ""
echo "🔧 Step 3: Verify EXACT Versions"
echo "---------------------------------"
echo "Node.js version:"
node --version  # Should be v20.17.0

echo "npm version:"
npm --version   # Should be 10.8.2

echo "Python version:"
python --version  # Should be 3.12.3

echo ""
echo "🔧 Step 4: Install Frontend Dependencies"
echo "----------------------------------------"
cd lovable-code-transplant

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force

# Install with exact same conditions as local
echo "📦 Installing dependencies..."
NODE_OPTIONS=--max-old-space-size=4096 npm install --legacy-peer-deps

echo ""
echo "🔧 Step 5: Install Backend Dependencies"
echo "---------------------------------------"
cd ../tradelayout-backtesting-engine

# Install exact Python packages
echo "📦 Installing Python packages..."
pip install --upgrade pip
pip install fastapi uvicorn python-multipart pako jszip

echo ""
echo "🎯 Step 6: Test Installation"
echo "----------------------------"
echo "Frontend build:"
cd ../lovable-code-transplant
npm run build

echo "Backend start:"
cd ../tradelayout-backtesting-engine
python backtest_api_server.py &

echo ""
echo "✅ VM Installation Complete!"
echo "==========================="
echo "🎯 Your VM now has EXACT same versions as local:"
echo "  Node.js: v20.17.0"
echo "  npm: 10.8.2"
echo "  Python: 3.12.3"
