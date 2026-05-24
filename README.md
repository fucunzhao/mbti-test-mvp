# MBTI 故事测 — 16型人格情景测试 MVP

基于生活故事的交互式性格测试系统。24题快速版 / 93题完整版，支持微信支付解锁结果。

## 技术栈

| 层 | 技术 | 平台 |
|---|------|------|
| 小程序端 | 微信小程序 | 微信 |
| 后端 | Node.js 云函数 | **腾讯云 CloudBase** |
| 数据库 | 文档型数据库 | **腾讯云 CloudBase** |
| 支付 | 微信支付 | 腾讯云内网直连 |

## 架构

```
微信小程序
    ↓
CloudBase 云函数 ← 内置微信登录+支付
    ↓
CloudBase 数据库（users/answers/orders/unlocks）
```

国内低延迟，微信生态原生支持，无需跨网络折腾。

## 项目结构

```
mbti-test-mvp/
├── cloudfunctions/              ← 云函数（核心）
│   ├── wx-login/               ← 微信登录
│   ├── submit-answers/         ← 提交答案 + 计算结果
│   ├── create-order/           ← 创建支付订单
│   ├── pay-callback/           ← 支付回调解锁结果
│   └── get-result/             ← 查询测试结果
├── index.html                  ← 纯前端测试页（开发调试用）
├── project.config.json         ← 微信开发者工具配置
├── DEPLOY.md                   ← 部署手册
└── README.md
```

## 快速部署

见 [DEPLOY.md](./DEPLOY.md)，5步完成：
1. 开通 CloudBase → 2. 创建数据库集合 → 3. 部署云函数 → 4. 配置支付 → 5. 小程序联调

## 前后端交互

| 云函数 | 输入 | 输出 |
|-------|------|------|
| wx-login | `{ code }` | `{ id, openid }` |
| submit-answers | `{ mode, answers }` | `{ answer_id, type, name }` |
| create-order | `{ answer_id }` | `{ order_id, pay_params }` |
| get-result | `{ answer_id }` | `{ locked, type, description }` |
| pay-callback | 微信自动回调 | 自动解锁结果 |
