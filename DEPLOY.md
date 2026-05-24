# MBTI 故事测 — 部署手册（Supabase 版）

## 架构

```
微信小程序 ──── Supabase（Edge Functions + PostgreSQL）
                ↑ 全部在 Supabase 内
```

无需任何第三方服务器。后端逻辑用 Supabase Edge Functions（TypeScript/Deno），数据库用 Supabase PostgreSQL，全部跑在 Supabase 基础设施上。

## 部署步骤

### 1. 创建 Supabase 项目
1. 访问 https://supabase.com → Sign up → 用 GitHub 登录
2. New project → 名称 `mbti-test-mvp` → 设置密码 → 区域选新加坡
3. 等待 1-2 分钟初始化

### 2. 导入数据库表
1. 进入项目 → SQL Editor
2. 粘贴 `supabase-schema.sql` 全部内容
3. 点 **Run** → 5 张表自动创建

### 3. 部署 Edge Functions
在本地终端执行（需安装 Supabase CLI）：

```bash
# 1. 登录
npx supabase login

# 2. 关联项目
npx supabase link --project-ref <你的项目引用ID>
# 项目引用ID 在 Project Settings → General → Reference ID

# 3. 部署所有函数
npx supabase functions deploy wx-login
npx supabase functions deploy submit-answers
npx supabase functions deploy create-order
npx supabase functions deploy pay-callback

# 4. 设置环境变量（每个函数都需要）
npx supabase secrets set SUPABASE_URL=https://xxx.supabase.co
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJxxx
npx supabase secrets set WX_APPID=你的微信小程序appid
npx supabase secrets set WX_SECRET=你的微信小程序secret
```

### 4. 获取 API 地址
部署后每个函数有自己的 URL：
```
https://<项目引用ID>.supabase.co/functions/v1/wx-login
https://<项目引用ID>.supabase.co/functions/v1/submit-answers
https://<项目引用ID>.supabase.co/functions/v1/create-order
https://<项目引用ID>.supabase.co/functions/v1/pay-callback
```

## 本地开发

```bash
# 安装 Supabase CLI
npm install -g supabase

# 启动本地开发环境
supabase start

# 热重载开发某个函数
supabase functions serve wx-login --env-file ./supabase/.env.local
```

## 项目结构

```
mbti-test-mvp/
├── index.html                          ← 纯前端测试页
├── supabase/
│   ├── schema.sql                      ← 数据库建表脚本
│   ├── config.toml                     ← Supabase 配置
│   └── functions/
│       ├── wx-login/index.ts           ← 微信登录
│       ├── submit-answers/index.ts     ← 提交答案+计算结果
│       ├── create-order/index.ts       ← 创建支付订单
│       └── pay-callback/index.ts       ← 支付回调处理
├── README.md
└── .gitignore
```

## 费用估算

| 项目 | 免费额度 | 预估用量 | 费用 |
|------|---------|---------|------|
| 数据库 | 500MB | 远低于 | 免费 |
| Edge Functions | 50万次/月 | 初期远低于 | 免费 |
| 认证 | 50000用户/月 | 初期够用 | 免费 |
| 带宽 | 5GB/月 | 够用 | 免费 |

Supabase 免费版足够支撑 MVP 阶段。
