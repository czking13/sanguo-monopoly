#!/bin/bash
# 三国大富翁 - 功能测试脚本 (使用 agent-browser)
# 使用方法: ./scripts/functional-test.sh

set -e

echo "=========================================="
echo "三国大富翁 - 功能测试"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

# 检查 agent-browser 是否安装
if ! command -v agent-browser &> /dev/null; then
    echo -e "${RED}agent-browser 未安装，正在安装...${NC}"
    npm install -g agent-browser
fi

# 启动本地开发服务器
echo ""
echo "【启动开发服务器】"
cd src/frontend
npm run dev > /tmp/vite-test.log 2>&1 &
VITE_PID=$!
sleep 3

# 获取端口号
PORT=$(grep -o "localhost:[0-9]*" /tmp/vite-test.log | head -1 | cut -d: -f2)
if [ -z "$PORT" ]; then
    PORT=3000
fi
echo "开发服务器运行在 http://localhost:$PORT"

# 清理函数
cleanup() {
    echo ""
    echo "清理中..."
    agent-browser close 2>/dev/null || true
    kill $VITE_PID 2>/dev/null || true
}
trap cleanup EXIT

# ==========================================
# 功能测试
# ==========================================
echo ""
echo "【1. 首页测试】"

# 打开首页
agent-browser open "http://localhost:$PORT" > /dev/null 2>&1
sleep 2

# 检查页面元素
snapshot=$(agent-browser snapshot -i 2>&1)
if echo "$snapshot" | grep -q "三国大富翁"; then
    pass "首页标题显示"
else
    fail "首页标题缺失"
fi

if echo "$snapshot" | grep -q "进入大厅"; then
    pass "进入大厅按钮显示"
else
    fail "进入大厅按钮缺失"
fi

# ==========================================
echo ""
echo "【2. 大厅测试】"

# 输入昵称
agent-browser fill @e2 "测试玩家" > /dev/null 2>&1
sleep 1

# 进入大厅
agent-browser click @e3 > /dev/null 2>&1
sleep 2

snapshot=$(agent-browser snapshot -i 2>&1)
if echo "$snapshot" | grep -q "游戏大厅"; then
    pass "大厅页面加载"
else
    fail "大厅页面加载失败"
fi

if echo "$snapshot" | grep -q "创建房间"; then
    pass "创建房间按钮显示"
else
    fail "创建房间按钮缺失"
fi

# ==========================================
echo ""
echo "【3. 创建房间测试】"

# 用 eval 触发点击（agent-browser click 对 Vue 事件有兼容问题）
agent-browser eval "document.querySelector('button.bg-gold').dispatchEvent(new MouseEvent('click', { bubbles: true }))" > /dev/null 2>&1
sleep 1

snapshot=$(agent-browser snapshot -i 2>&1)
if echo "$snapshot" | grep -q "创建房间"; then
    pass "创建房间弹窗显示"
else
    fail "创建房间弹窗未出现"
fi

# 填写房间信息
agent-browser fill @e12 "测试房间" > /dev/null 2>&1
sleep 1
agent-browser click @e16 > /dev/null 2>&1
sleep 2

snapshot=$(agent-browser snapshot -i 2>&1)
if echo "$snapshot" | grep -q "邀请好友"; then
    pass "房间页面加载"
else
    fail "房间页面加载失败"
fi

# ==========================================
echo ""
echo "【4. 武将选择测试】"

# 添加机器人
agent-browser click @e6 > /dev/null 2>&1
sleep 1
agent-browser click @e6 > /dev/null 2>&1
sleep 1

# 选择武将
agent-browser eval "document.querySelector('[class*=\"border-slate\"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))" > /dev/null 2>&1
sleep 1

snapshot=$(agent-browser snapshot -i 2>&1)
if echo "$snapshot" | grep -q "开始游戏"; then
    pass "武将选择成功"
else
    fail "武将选择失败"
fi

# ==========================================
echo ""
echo "【5. 游戏启动测试】"

# 开始游戏
agent-browser click @e6 > /dev/null 2>&1
sleep 3

snapshot=$(agent-browser snapshot -i 2>&1)
if echo "$snapshot" | grep -q "掷骰子\|结束回合"; then
    pass "游戏界面加载"
else
    fail "游戏界面加载失败"
fi

# 截图保存
agent-browser screenshot /tmp/game-screenshot.png > /dev/null 2>&1
if [ -f /tmp/game-screenshot.png ]; then
    pass "游戏截图保存"
else
    fail "游戏截图失败"
fi

# ==========================================
# 测试结果
# ==========================================
echo ""
echo "=========================================="
echo "功能测试结果"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"

if [ $FAIL -gt 0 ]; then
    echo ""
    echo -e "${RED}存在失败项，请修复后再提 PR！${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}所有功能测试通过！${NC}"
    exit 0
fi
