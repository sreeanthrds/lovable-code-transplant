# VM Installation Guide - Troubleshooting Differences

## 🔍 Local vs VM Environment Differences

### **Local Environment (Working):**
- **Node.js:** v20.17.0
- **npm:** 10.8.2
- **Python:** 3.12.3
- **OS:** macOS
- **Memory:** Usually 16GB+
- **Network:** Open, no restrictions
- **Disk:** Usually ample space

### **VM Environment (Issues):**
- **Node.js:** Might be older version (v16, v18)
- **npm:** Might be older version (7.x, 8.x)
- **Python:** Might be different version (3.8, 3.9)
- **OS:** Linux (Ubuntu/CentOS/Debian)
- **Memory:** Usually limited (2GB-4GB)
- **Network:** May have restrictions
- **Disk:** Limited space

## 🚨 Common VM Installation Issues

### **1. Node.js Version Mismatch**
```bash
# Check version
node --version

# If older than v18, update:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using snap:
sudo snap install node --classic --channel=20
```

### **2. npm Version Too Old**
```bash
# Update npm to latest
npm install -g npm@latest

# Verify version
npm --version
```

### **3. Memory Issues**
```bash
# Check available memory
free -h

# Increase Node.js memory limit
export NODE_OPTIONS=--max-old-space-size=4096

# Install with increased memory
NODE_OPTIONS=--max-old-space-size=4096 npm install
```

### **4. Dependency Conflicts**
```bash
# Clear npm cache
npm cache clean --force

# Use legacy peer deps (our fix)
npm install --legacy-peer-deps

# Or force install
npm install --force
```

### **5. Network Issues**
```bash
# Check internet connectivity
curl -I https://github.com
curl -I https://registry.npmjs.org

# Set npm registry if needed
npm config set registry https://registry.npmjs.org/

# Use npm mirror if needed
npm config set registry https://npm.pkg.github.com/
```

### **6. Python Dependencies**
```bash
# Check Python version
python3 --version

# Install required Python packages
pip3 install --upgrade pip
pip3 install fastapi uvicorn python-multipart
```

### **7. OS Package Dependencies**
```bash
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install -y python3 python3-pip nodejs npm build-essential

# CentOS/RHEL:
sudo yum update
sudo yum install -y python3 python3-pip nodejs npm gcc gcc-c++ make

# Or using dnf (newer CentOS):
sudo dnf update
sudo dnf install -y python3 python3-pip nodejs npm gcc gcc-c++ make
```

## 🔧 Step-by-Step VM Installation

### **Step 1: Prepare Environment - EXACT Versions**
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install essential build tools
sudo apt-get install -y build-essential python3 python3-pip curl wget

# Install EXACT Node.js v20.17.0 (not "latest")
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nvm for precise version control
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install EXACT Node.js v20.17.0
nvm install 20.17.0
nvm use 20.17.0
nvm alias default 20.17.0

# Install EXACT npm 10.8.2 (not "latest")
npm install -g npm@10.8.2

# Install pyenv for precise Python version control
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev

curl https://pyenv.run | bash
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# Install EXACT Python 3.12.3
pyenv install 3.12.3
pyenv global 3.12.3

# Verify EXACT versions
node --version  # Should be v20.17.0
npm --version   # Should be 10.8.2
python --version # Should be 3.12.3
```

### **Step 2: Clone and Install Frontend**
```bash
# Clone repository
git clone https://github.com/sreeanthrds/lovable-code-transplant.git
cd lovable-code-transplant

# Switch to production branch
git checkout production

# Clear any existing modules
rm -rf node_modules package-lock.json

# Install with our fixes
npm install --legacy-peer-deps

# If still fails, try with more memory
NODE_OPTIONS=--max-old-space-size=4096 npm install --legacy-peer-deps
```

### **Step 3: Clone and Install Backend**
```bash
# Clone repository
git clone https://github.com/sreeanthrds/tradelayout-backtesting-engine.git
cd tradelayout-backtesting-engine

# Switch to production branch
git checkout production

# Install Python dependencies
pip3 install --upgrade pip
pip3 install -r requirements.txt  # if exists
pip3 install fastapi uvicorn python-multipart pako jszip
```

### **Step 4: Update Supabase Configuration**
```bash
# Update API config for VM environment
# Use the setup_environment_config.py script we created
python3 setup_environment_config.py
# Choose option 2 for VM and enter your VM domain
```

### **Step 5: Test Installation**
```bash
# Frontend
cd lovable-code-transplant
npm run build  # Should succeed
npm run dev    # Should start on port 8080

# Backend
cd tradelayout-backtesting-engine
python3 backtest_api_server.py  # Should start on port 8001
```

## 🐛 Debugging Specific Issues

### **Issue: "npm ERR! peer dep missing"**
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

### **Issue: "JavaScript heap out of memory"**
```bash
# Solution: Increase memory limit
export NODE_OPTIONS=--max-old-space-size=4096
npm install
```

### **Issue: "EACCES: permission denied"**
```bash
# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
npm install
```

### **Issue: "Cannot find module 'fastapi'"**
```bash
# Solution: Install Python dependencies
pip3 install fastapi uvicorn python-multipart
```

### **Issue: "Port already in use"**
```bash
# Solution: Change ports or kill processes
sudo lsof -i :8080
sudo lsof -i :8001
sudo kill -9 <PID>
```

## 📊 Quick VM Health Check

Run this script in your VM to identify issues:
```bash
# Download and run troubleshooting script
wget https://raw.githubusercontent.com/your-repo/vm_troubleshooting.sh
chmod +x vm_troubleshooting.sh
./vm_troubleshooting.sh
```

## 🎯 Expected Working VM Setup

After successful installation, you should have:
- **Node.js v20.x.x**
- **npm 10.x.x**
- **Python 3.8+**
- **Frontend builds successfully**
- **Backend starts on port 8001**
- **Supabase configuration working**

## 🚀 Final VM Deployment Commands

```bash
# Frontend
cd lovable-code-transplant
npm run build
npm run dev &

# Backend
cd tradelayout-backtesting-engine
python3 backtest_api_server.py &

# Test
curl http://localhost:8001/health
curl http://localhost:8080
```

This should help identify and resolve the differences between your local and VM environments!
