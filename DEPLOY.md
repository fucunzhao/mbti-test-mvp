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

**第1步：打开腾讯云控制台**
- 浏览器打开 https://console.cloud.tencent.com/tcb
- 如果未登录，用微信扫码登录（推荐）或 QQ 登录
- 首次使用会弹出「服务授权」，点 **同意授权**

**第2步：新建环境**
- 页面加载后，左侧菜单确认当前是「云开发 CloudBase」
- 点击页面中央的 **「新建环境」** 按钮（蓝色按钮，在页面中间偏上位置）
- 如果找不到，也可以点顶部导航的 **「新建」** → **「新建环境」**

**第3步：填写环境信息**
在弹出的对话框中：
- **环境名称**：输入 `mbti-test`（小写字母，可以用短横线）
- **环境类型**：选择 **「按量计费」**（免费额度用完后才收费，个人项目基本花不到钱）
- 勾选同意《腾讯云开发者社区服务协议》
- 点击底部 **「立即开通」** 按钮

**第4步：等待创建完成**
- 页面跳转到环境列表，显示「创建中」，约 1-2 分钟
- 创建完成后状态变为「运行中」
- 点击环境名称 `mbti-test` 进入环境管理页面
- **你已进入 CloudBase 控制台首页**，左侧菜单有：数据库、云函数、云存储、微信支付 等

### 2. 创建数据库集合

**第1步：进入数据库页面**
- 在 CloudBase 控制台首页，看**左侧菜单栏**
- 找到 **「数据库」**（图标是一个柱状图，在「云函数」上面）
- 点击进入数据库管理页面

**第2步：新建 users 集合**
- 页面中央有一个 **「新建集合」** 按钮（蓝色），点击它
- 在弹出的对话框中：
  - **集合名称**：输入 `users`（全小写）
  - **描述**：可以不填
  - 点击 **「确定」**
- 等待 1-2 秒，集合创建完成

**第3步：重复创建其余3个集合**
- 用同样方法再创建 3 个集合：

| 集合名 | 说明 |
|-------|------|
| `answers` | 答题记录 |
| `orders` | 支付订单 |
| `unlocks` | 结果解锁记录 |

完成后数据库列表应该有 4 个集合。

**第4步：给 users 集合添加索引（重要）**
- 在数据库列表中，点击 **`users`** 集合名称进入
- 顶部切换到 **「索引」** 标签页（在「数据」旁边）
- 点击 **「添加索引」** 按钮
- 在弹出的对话框中：
  - **字段名**：输入 `openid`
  - **升序/降序**：选「升序」
  - **唯一**：勾选 ✅（很重要，防止重复用户）
  - 点击 **「确定」**

### 3. 部署云函数

#### 方式一：用微信开发者工具（推荐）

**第1步：安装微信开发者工具**
- 浏览器打开 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
- 下载对应系统的稳定版
- 安装完成后，用微信扫码登录

**第2步：导入项目**
- 打开微信开发者工具
- 点击 **「导入项目」**（蓝色按钮，在界面中央）
- **项目目录**：点击「选择」，找到 `D:\Codex\mbti-test-mvp` 这个文件夹
- **AppID**：输入你的微信小程序 AppID（如果没有，先去微信公众平台注册小程序）
- **项目名称**：会自动填入，保持 `mbti-test-mvp` 即可
- 点击 **「确定」** 导入

**第3步：关联 CloudBase 环境**
- 导入后，顶部菜单栏找到 **「云开发」** 按钮（一朵云图标，在菜单栏靠右位置）
- 点击后弹出窗口，点击 **「开通」**
- 在弹出的列表中选择你刚创建的 `mbti-test` 环境
- 点击 **「确定」**

**第4步：上传部署云函数**
- 在开发者工具左侧文件树中，找到 **`cloudfunctions`** 目录
- **右键点击** `cloudfunctions` 目录
- 选择 **「同步云函数列表」**
- 等待同步完成，5个云函数目录下方会出现「云函数」的小图标
- 逐个右键点击每个云函数目录（wx-login、submit-answers 等）
- 选择 **「上传并部署：云端安装依赖」**（选这个，会帮你自动装好依赖包）
- 等待每个部署完成（底部输出栏显示「部署成功」）
- 全部5个部署完成后，5个云函数左侧图标变为绿色✅

#### 方式二：用 CloudBase CLI（适合熟悉命令行的用户）

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
