/**
 * MBTI 故事测 — 查询测试结果
 * 
 * 输入: { answer_id: "xxx" }
 * 输出: 未支付则返回预览，已支付返回完整结果
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const TYPE_DESCS = {
  'INTJ': '你有远见且独立，习惯用逻辑规划一切。能力是你唯一的通行证。',
  'INTP': '你喜欢探索一切事物的底层逻辑。你在意的不是答案，而是问题本身。',
  'ENTJ': '你天生有领导力，目标明确、行动果断。在你的字典里没有解决不了的问题。',
  'ENTP': '你思维敏捷，喜欢挑战一切既有的东西。辩论是你的本能。',
  'INFJ': '你能敏锐察觉别人的情绪，同时坚定地守护自己的原则。温和的外表下有力量。',
  'INFP': '你是一个理想主义者。你的温柔是一种有底气的力量。',
  'ENFJ': '你有天然的感染力，善于鼓舞和凝聚他人。你是天生的引领者。',
  'ENFP': '你充满热情和创造力，你的生命力会感染每一个人。',
  'ISTJ': '你可靠、务实、信守承诺。你是团队里最稳的那根柱子。',
  'ISFJ': '你温柔而可靠，默默守护着你在意的人和事。',
  'ESTJ': '你讲究效率和执行力，是天生的管理者。',
  'ESFJ': '你热心负责，注重人际关系。大家一起好才是真的好。',
  'ISTP': '你动手能力强，遇事冷静。你是关键时刻最可靠的人。',
  'ISFP': '你随和安静，以自己的节奏感受世界。',
  'ESTP': '你行动力爆棚，反应快、敢冒险。你是说干就干的人。',
  'ESFP': '你开朗活泼，和你在一起永远不会无聊。'
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { error: '未登录' }

  const { answer_id } = event
  if (!answer_id) return { error: '缺少 answer_id' }

  const res = await db.collection('answers').doc(answer_id).get()
  if (!res.data) return { error: '记录不存在' }

  const answer = res.data
  const type = answer.result_type

  if (!answer.is_paid) {
    // 未支付 → 预览版
    return {
      locked: true,
      message: '支付 ¥0.99 后查看完整结果',
      preview: {
        type,
        name: TYPE_DESCS[type] ? type : '',
        dimensions: `${answer.ei}/${answer.sn}/${answer.tf}/${answer.jp}`
      }
    }
  }

  // 已支付 → 完整结果
  const dimLabels = {
    'E': '外向 · 从社交中获得能量', 'I': '内向 · 从独处中获得能量',
    'S': '实感 · 关注具体细节和事实', 'N': '直觉 · 关注整体模式和可能性',
    'T': '思考 · 用逻辑做决策', 'F': '情感 · 用感受做决策',
    'J': '计划 · 喜欢有条理的生活', 'P': '随性 · 喜欢灵活自由的生活'
  }

  return {
    locked: false,
    type,
    name: TYPE_DESCS[type] ? '「' + type + '」' : '',
    description: TYPE_DESCS[type] || '',
    dimensions: [
      { dim: 'E/I', letter: answer.ei, label: dimLabels[answer.ei], score: answer.ei_score },
      { dim: 'S/N', letter: answer.sn, label: dimLabels[answer.sn], score: answer.sn_score },
      { dim: 'T/F', letter: answer.tf, label: dimLabels[answer.tf], score: answer.tf_score },
      { dim: 'J/P', letter: answer.jp, label: dimLabels[answer.jp], score: answer.jp_score }
    ],
    created_at: answer.created_at
  }
}
