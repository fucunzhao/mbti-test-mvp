/**
 * MBTI 故事测 — 创建支付订单
 * 
 * 输入: { answer_id: "xxx" }
 * 输出: { order_id, out_trade_no, amount, pay_params }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { error: '未登录' }

  const userRes = await db.collection('users').where({ openid: OPENID }).get()
  if (!userRes.data.length) return { error: '用户不存在' }
  const userId = userRes.data[0]._id

  const { answer_id } = event
  if (!answer_id) return { error: '缺少 answer_id' }

  // 生成订单号：MBTI + 年月日时分秒 + 4位随机
  const pad = (n) => String(n).padStart(2, '0')
  const now = new Date()
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  const outTradeNo = `MBTI${ts}${rand}`

  // ===== CloudBase 微信支付 =====
  try {
    const result = await cloud.cloudPay.unifiedOrder({
      body: 'MBTI人格测试结果解锁',
      outTradeNo,
      spbillCreateIp: '127.0.0.1',
      subMchId: '',       // TODO: 填入你的商户号
      totalFee: 99,        // 0.99元
      envId: process.env.ENV_ID,
      functionName: 'pay-callback'
    })

    // 保存订单
    await db.collection('orders').add({
      data: {
        user_id: userId,
        answer_id,
        out_trade_no: outTradeNo,
        transaction_id: '',
        amount: 99,
        status: 'pending',
        created_at: now
      }
    })

    return {
      order_id: outTradeNo,
      out_trade_no: outTradeNo,
      amount: 99,
      pay_params: result.payment    // 小程序端直接 wx.requestPayment(result.payment)
    }

  } catch (err) {
    return { error: '创建订单失败: ' + err.message }
  }
}
