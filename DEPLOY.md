# MBTI 故事测 — 部署手册（腾讯云 CloudBase 版）

## 架构

```
微信小程序 ←→ 腾讯云 CloudBase
                  ├── 云函数（Node.js）   ← 你在这里
                  ├── 云数据库（文档型）
                  └── 云存储
```

全部在腾讯云国内服务器上，低延迟、微信支付原生支持。

## 部署步骤

### 1. 开通 CloudBase
1. 访问 https://console.cloud.tencent.com/tcb
2. 点「新建环境」→ 输入环境名称 `mbti-test`
3. 选择「按量计费」（免费额度用完后才收费）
4. 等待 1-2 分钟创建完成

### 2. 创建数据库集合
CloudBase 控制台 → 数据库 → 新建集合：

| 集合名 | 说明 | 权限 |
|-------|------|------|
| `users` | 用户 | 所有用户可读，仅管理员可写 |
| `answers` | 答题记录 | 所有用户可读，仅管理员可写 |
| `orders` | 支付订单 | 所有用户可读，仅管理员可写 |
| `unlocks` | 结果解锁记录 | 所有用户可读，仅管理员可写 |

创建后在 **users 集合** → 添加一个索引：字段 `openid`，唯一索引。

### 3. 部署云函数
方式一：用微信开发者工具
1. 安装微信开发者工具
2. 导入项目，选择 `mbti-test-mvp` 目录
3. 填入你的小程序 appid
4. 右键 cloudfunctions → 同步云函数列表
5. 逐个右键部署即可

方式二：用 CloudBase CLI

```bash
# 安装
npm install -g @cloudbase/cli

# 登录
tcb login

# 关联环境
tcb env:switch mbti-test

# 部署所有云函数
tcb functions:deploy wx-login -e mbti-test
tcb functions:deploy submit-answers -e mbti-test  
tcb functions:deploy create-order -e mbti-test
tcb functions:deploy pay-callback -e mbti-test
tcb functions:deploy get-result -e mbti-test
```

### 4. 配置微信支付（上线前）
1. 在 CloudBase 控制台 → 微信支付 → 授权
2. 填入微信支付商户号
3. 在 `cloudfunctions/create-order/index.js` 中填入 `subMchId`

### 5. 小程序前端调用示例

```javascript
// 微信小程序端调用云函数
const wxCloud = require('wx-server-sdk')
wxCloud.init()

// 微信登录
const result = await wxCloud.callFunction({
  name: 'wx-login'
})

// 提交答案
const answer = await wxCloud.callFunction({
  name: 'submit-answers',
  data: { mode: 'quick', answers: ['a','b','a',...] }
})

// 创建支付
const order = await wxCloud.callFunction({
  name: 'create-order',
  data: { answer_id: answer.result.answer_id }
})

// 发起支付
wx.requestPayment(order.result.pay_params)

// 查询结果
const result = await wxCloud.callFunction({
  name: 'get-result',
  data: { answer_id: 'xxx' }
})
```

## 费用

| 资源 | 免费额度 | MVP 够用吗 |
|------|---------|-----------|
| 云函数调用 | 100万次/月 | ✅ 远超够用 |
| 数据库 | 2GB 存储 | ✅ 足够 |
| CDN 流量 | 10GB/月 | ✅ 足够 |
| 微信支付 | 0.6% 手续费 | 每单 0.99元 手续费约 0.006元 |

CloudBase 免费额度足够 MVP 跑很久。
