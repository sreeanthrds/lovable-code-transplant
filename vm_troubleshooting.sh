#!/bin/bash

echo "🔍 VM Installation Troubleshooting Script"
echo "=========================================="

echo ""
echo "📋 Step 1: Check Node.js and npm versions"
echo "------------------------------------------"
echo "Local versions:"
echo "  Node.js: v20.17.0"
echo "  npm: 10.8.2"
echo ""
echo "VM versions:"
node --version 2>/dev/null || echo "  Node.js: NOT INSTALLED"
npm --version 2>/dev/null || echo "  npm: NOT INSTALLED"

echo ""
echo "📋 Step 2: Check Python version"
echo "--------------------------------"
echo "Local version:"
echo "  Python: 3.12.3"
echo ""
echo "VM version:"
python3 --version 2>/dev/null || echo "  Python: NOT INSTALLED"

echo ""
echo "📋 Step 3: Check if package.json exists"
echo "----------------------------------------"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "📊 Dependencies count:"
    grep -c '"[^"]*":' package.json | head -1
else
    echo "❌ package.json NOT found"
fi

echo ""
echo "📋 Step 4: Check node_modules status"
echo "------------------------------------"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
    echo "📊 Module count:"
    find node_modules -maxdepth 1 -type d | wc -l
else
    echo "❌ node_modules NOT found"
fi

echo ""
echo "📋 Step 5: Check available disk space"
echo "------------------------------------"
df -h . | tail -1 | awk '{print "💾 Available: " $4 " (Used: " $5 ")"}'

echo ""
echo "📋 Step 6: Check memory"
echo "----------------------"
free -h 2>/dev/null | grep -E "(Mem|Swap)" || echo "❌ Memory info not available"

echo ""
echo "📋 Step 7: Check network connectivity"
echo "-------------------------------------"
echo "🌐 GitHub connectivity:"
curl -s --connect-timeout 5 https://github.com > /dev/null && echo "✅ GitHub reachable" || echo "❌ GitHub NOT reachable"

echo ""
echo "🌐 Supabase connectivity:"
curl -s --connect-timeout 5 https://oonepfqgzpdssfzvokgk.supabase.co > /dev/null && echo "✅ Supabase reachable" || echo "❌ Supabase NOT reachable"

echo ""
echo "📋 Step 8: Try npm install with verbose output"
echo "---------------------------------------------"
echo "🔄 Running: npm install --verbose"
echo "⏱️ This may take a few minutes..."
echo ""
echo "💡 TROUBLESHOOTING TIPS:"
echo "   1. If npm install fails, try: npm install --legacy-peer-deps"
echo "   2. If out of memory, try: npm install --max-old-space-size=4096"
echo "   3. If network issues, try: npm config set registry https://registry.npmjs.org/"
echo "   4. If permissions issue, try: sudo npm install"
echo ""
echo "🚀 To run the install now, execute:"
echo "   npm install --verbose 2>&1 | tee npm-install.log"
echo ""
echo "📋 Step 9: Common VM vs Local Differences"
echo "-----------------------------------------"
echo "🔍 COMMON ISSUES:"
echo "   ❌ Node.js version mismatch (VM might have older version)"
echo "   ❌ npm version too old"
echo "   ❌ Insufficient memory (VM usually has less RAM)"
echo "   ❌ Disk space limitations"
echo "   ❌ Network restrictions/firewall"
echo "   ❌ Different OS package dependencies"
echo "   ❌ Python version mismatch"
echo ""
echo "✅ SOLUTIONS:"
echo "   1. Update Node.js: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
echo "   2. Update npm: npm install -g npm@latest"
echo "   3. Clear npm cache: npm cache clean --force"
echo "   4. Use legacy deps: npm install --legacy-peer-deps"
echo "   5. Increase memory: export NODE_OPTIONS=--max-old-space-size=4096"

echo ""
echo "🔍 VM Installation Troubleshooting Complete!"
echo "============================================="
