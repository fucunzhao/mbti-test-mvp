# MBTI 故事测 — 16型人格情景测试 MVP

## 架构

```
微信小程序 ──→ Zeabur（FastAPI）──→ Supabase（PostgreSQL）
```

## 部署步骤

### 1. Supabase 数据库
1. 在 supabase.com 创建项目
2. 进入 SQL Editor，粘贴执行 `supabase-schema.sql`
3. 获取项目 URL 和 `service_role key`（Project Settings → API）

### 2. Zeabur 部署
1. 进入 zeabur.com → 新建项目 → 从 GitHub 导入本仓库
2. 设置环境变量：
   - `SUPABASE_URL` = 你的 Supabase 项目 URL
   - `SUPABASE_KEY` = 你的 service_role key
3. 部署完成

### 3. 微信小程序（后续）
1. 注册微信小程序，完成企业认证
2. 开通微信支付
3. 在 Zeabur 添加环境变量：
   - `WX_APPID`、`WX_MCHID`、`WX_KEY`

## API 文档

部署后访问 `https://你的域名/docs` 查看 Swagger 文档。

## 本地开发

```bash
pip install -r requirements.txt
# 复制 .env.example 为 .env，填入配置
uvicorn server:app --reload --port 8000
```
