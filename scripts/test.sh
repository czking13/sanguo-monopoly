#!/bin/bash
# 三国大富翁 - 发布前自动化测试脚本
# 使用方法: ./scripts/test.sh

set -e

echo "=========================================="
echo "三国大富翁 - 发布前测试"
echo "=========================================="

FRONTEND_DIR="src/frontend"
PASS=0
FAIL=0

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ==========================================
# 1. 构建测试
# ==========================================
echo ""
echo "【1. 构建测试】"

cd $FRONTEND_DIR

echo "1.1 前端构建..."
if npm run build > /dev/null 2>&1; then
    pass "前端构建成功"
else
    fail "前端构建失败"
fi

echo "1.2 检查构建产物..."
if [ -f "dist/index.html" ]; then
    pass "dist/index.html 存在"
else
    fail "dist/index.html 不存在"
fi

if [ -d "dist/assets" ] && [ $(ls dist/assets | wc -l) -gt 0 ]; then
    pass "dist/assets/ 有文件"
else
    fail "dist/assets/ 为空"
fi

# ==========================================
# 2. 文件完整性测试
# ==========================================
echo ""
echo "【2. 文件完整性测试】"

echo "2.1 页面文件..."
for page in Home Lobby Room Game; do
    if [ -f "src/views/${page}.vue" ]; then
        pass "${page}.vue 存在"
    else
        fail "${page}.vue 缺失"
    fi
done

echo "2.2 关键组件..."
for comp in GameMap CardModal; do
    if [ -f "src/components/${comp}.vue" ]; then
        pass "${comp}.vue 存在"
    else
        fail "${comp}.vue 缺失"
    fi
done

echo "2.3 数据文件..."
for data in heroes cards gameData; do
    if [ -f "src/data/${data}.ts" ]; then
        pass "${data}.ts 存在"
    else
        fail "${data}.ts 缺失"
    fi
done

echo "2.4 武将头像..."
cd ..
hero_count=$(ls assets/heroes/*.jpg 2>/dev/null | wc -l)
if [ "$hero_count" -ge 17 ]; then
    pass "武将头像 ($hero_count 个)"
else
    warn "武将头像不足 (当前 $hero_count 个)"
fi

# ==========================================
# 3. 类型检查
# ==========================================
echo ""
echo "【3. 类型检查】"

cd $FRONTEND_DIR
echo "3.1 TypeScript 检查..."
type_errors=$(npx vue-tsc --noEmit 2>&1 | grep -c "error TS[0-9]*:" || true)
if [ "$type_errors" -eq 0 ]; then
    pass "类型检查无错误"
else
    warn "类型检查有 $type_errors 个错误（非阻塞）"
fi

# ==========================================
# 4. 部署后验证（如果指定了 --deploy）
# ==========================================
if [ "$1" == "--deploy" ]; then
    echo ""
    echo "【4. 部署后验证】"
    
    echo "等待部署完成..."
    sleep 30
    
    echo "4.1 检查网站状态..."
    http_code=$(curl -s -o /dev/null -w "%{http_code}" https://sanguo-monopoly.vercel.app)
    if [ "$http_code" == "200" ]; then
        pass "网站 HTTP 200"
    else
        fail "网站 HTTP $http_code"
    fi
    
    echo "4.2 检查页面标题..."
    title=$(curl -s https://sanguo-monopoly.vercel.app | grep -o "<title>.*</title>" | sed 's/<\/\?title>//g')
    if [ "$title" == "三国大富翁" ]; then
        pass "页面标题正确"
    else
        fail "页面标题错误: $title"
    fi
fi

# ==========================================
# 测试结果
# ==========================================
echo ""
echo "=========================================="
echo "测试结果"
echo "=========================================="
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"

if [ $FAIL -gt 0 ]; then
    echo ""
    echo -e "${RED}存在失败项，请修复后再部署！${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}所有测试通过，可以部署！${NC}"
    exit 0
fi
