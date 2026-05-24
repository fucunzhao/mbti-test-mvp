/**
 * MBTI 故事测 — 支付回调
 * 
 * 微信支付成功后，CloudBase 自动触发此云函数
 * 更新订单状态 + 解锁结果
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  // CloudBase 支付回调的 event 结构
  // { outTradeNo, transactionId, resultCode, errCode, errCodeDes }
  
  const { outTradeNo, transactionId, resultCode } = event

  if (resultCode !== 'SUCCESS') {
    console.error('支付失败:', event)
    return { errCode: 1, errMsg: '支付失败' }
  }

  try {
    // 查找订单
    const orderRes = await db.collection('orders')
      .where({ out_trade_no: outTradeNo })
      .get()

    if (!orderRes.data.length) {
      console.error('订单不存在:', outTradeNo)
      return { errCode: 1 }
    }

    const order = orderRes.data[0]

    // 更新订单状态
    await db.collection('orders').doc(order._id).update({
      data: {
        status: 'paid',
        transaction_id: transactionId,
        paid_at: new Date()
      }
    })

    // 解锁结果
    await db.collection('answers').doc(order.answer_id).update({
      data: { is_paid: true }
    })

    // 记录解锁
    await db.collection('unlocks').add({
      data: {
        user_id: order.user_id,
        answer_id: order.answer_id,
        order_id: order._id,
        out_trade_no: outTradeNo,
        created_at: new Date()
      }
    })

    console.log(`解锁成功: ${outTradeNo}`)
    return { errCode: 0, errMsg: 'OK' }

  } catch (err) {
    console.error('回调处理异常:', err)
    return { errCode: 1, errMsg: err.message }
  }
}
