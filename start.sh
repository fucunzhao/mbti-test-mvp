#!/bin/bash
echo "MBTI 16型人格情景测试 MVP"
echo "=========================="
echo ""
echo "方式一：纯前端模式"
echo "  直接用浏览器打开 index.html"
echo ""
echo "方式二：后端模式（可保存历史记录）"
echo "  python3 server.py"
echo ""
echo "启动后端模式..."
cd "$(dirname "$0")"
python3 server.py
