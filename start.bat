@echo off
echo MBTI 16型人格情景测试 MVP
echo ==========================
echo.
echo 方式一：纯前端模式
echo   直接用浏览器打开 index.html
echo.
echo 方式二：后端模式（可保存历史记录）
echo   python server.py
echo.
echo 启动后端模式...
cd /d "%~dp0"
python server.py
pause
