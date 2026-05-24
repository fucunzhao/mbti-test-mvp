/**
 * MBTI 故事测 — 提交答案 + 计算结果
 * 
 * 输入: { mode: "quick"|"full", answers: ["a","b","a",...] }
 * 输出: { answer_id, type, name, dimensions, is_paid: false }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const TYPE_NAMES = {
  'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
  'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
  'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
  'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
}

function calcResult(answers, mode) {
  const dimLen = mode === 'quick' ? 6 : answers.length / 4
  const groups = [
    answers.slice(0, dimLen),
    answers.slice(dimLen, dimLen * 2),
    answers.slice(dimLen * 2, dimLen * 3),
    answers.slice(dimLen * 3, dimLen * 4)
  ]
  const threshold = Math.ceil(groups[0].length / 2)

  const labels = [
    { key: 'E', opp: 'I' },
    { key: 'S', opp: 'N' },
    { key: 'T', opp: 'F' },
    { key: 'J', opp: 'P' }
  ]

  const results = groups.map((g, i) => {
    const aCount = g.filter(x => x === 'a').length
    const letter = aCount >= threshold ? labels[i].key : labels[i].opp
    return { letter, score: aCount, total: g.length }
  })

  const type = results.map(r => r.letter).join('')
  return { type, name: TYPE_NAMES[type] || '', results }
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { error: '未登录' }

  const { mode, answers } = event
  if (!['quick', 'full'].includes(mode)) return { error: 'mode 无效' }
  if (!Array.isArray(answers) || answers.length < 24) return { error: '答案不足' }

  const { type, name, results } = calcResult(answers, mode)

  // 查询用户
  const userRes = await db.collection('users').where({ openid: OPENID }).get()
  if (!userRes.data.length) return { error: '用户不存在' }
  const userId = userRes.data[0]._id

  // 保存答题记录
  const insertRes = await db.collection('answers').add({
    data: {
      user_id: userId,
      mode,
      answers,
      result_type: type,
      ei: results[0].letter, sn: results[1].letter,
      tf: results[2].letter, jp: results[3].letter,
      ei_score: results[0].score, sn_score: results[1].score,
      tf_score: results[2].score, jp_score: results[3].score,
      is_paid: false,
      created_at: new Date()
    }
  })

  // 更新用户测试次数
  await db.collection('users').doc(userId).update({
    data: { test_count: db.command.inc(1) }
  })

  return {
    answer_id: insertRes._id,
    type,
    name,
    dimensions: results.map(r => r.letter),
    scores: results.map(r => `${r.score}/${r.total}`),
    is_paid: false
  }
}
