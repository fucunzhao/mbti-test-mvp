/**
 * MBTI 故事测 — 微信登录
 * 
 * CloudBase 云函数
 * 微信小程序端调用 wx.login() 获取 code 后传入
 * 
 * 输入: { code: "xxx" }
 * 输出: { id, openid, is_new }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) {
    return { error: '获取用户信息失败' }
  }

  // 查询用户
  const result = await db.collection('users').where({ openid: OPENID }).get()
  let user = result.data[0]
  let isNew = false

  if (!user) {
    // 新建用户
    const now = new Date()
    const insertResult = await db.collection('users').add({
      data: {
        openid: OPENID,
        nick_name: event.nickName || '',
        avatar_url: event.avatarUrl || '',
        created_at: now,
        last_login: now,
        test_count: 0
      }
    })
    user = { id: insertResult._id, openid: OPENID }
    isNew = true
  } else {
    // 更新最后登录
    await db.collection('users').doc(user._id).update({
      data: { last_login: new Date() }
    })
  }

  return {
    id: user._id,
    openid: OPENID,
    is_new: isNew
  }
}
