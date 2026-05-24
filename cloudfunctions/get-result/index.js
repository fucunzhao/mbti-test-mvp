/**
 * MBTI 故事测 — 查询测试结果 + 完整人格评估报告
 * 
 * 输入: { answer_id: "xxx" }
 * 输出: 未支付 → 预览 + 支付提示
 *       已支付 → 完整结果 + 16型人格评估报告
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const REPORTS = require('./report-data.js')

const SECTIONS = [
  { key: 'overview', label: '类型概述' },
  { key: 'coreTraits', label: '核心特质' },
  { key: 'strengths', label: '优势清单' },
  { key: 'weaknesses', label: '待发展领域' },
  { key: 'careerAdvice', label: '职业发展建议' },
  { key: 'suitableCareers', label: '推荐职业方向' },
  { key: 'relationships', label: '人际关系指南' },
  { key: 'communication', label: '沟通风格' },
  { key: 'growth', label: '个人成长建议' },
  { key: 'famousPeople', label: '代表人物' },
  { key: 'funFact', label: '趣味标签' }
]

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
    const report = REPORTS[type]
    return {
      locked: true,
      message: '支付 ¥0.99 后查看完整结果',
      preview: {
        type,
        name: report ? report.name : '',
        summary: report ? report.summary : '',
        dimensions: `${answer.ei}/${answer.sn}/${answer.tf}/${answer.jp}`
      }
    }
  }

  // 已支付 → 完整结果 + 详细报告
  const report = REPORTS[type]
  if (!report) return { error: '报告数据异常' }

  const dimLabels = {
    'E': '外向 · 从社交中获得能量', 'I': '内向 · 从独处中获得能量',
    'S': '实感 · 关注具体细节和事实', 'N': '直觉 · 关注整体模式和可能性',
    'T': '思考 · 用逻辑做决策', 'F': '情感 · 用感受做决策',
    'J': '计划 · 喜欢有条理的生活', 'P': '随性 · 喜欢灵活自由的生活'
  }

  const sections = SECTIONS.map(s => {
    let content = report[s.key]
    if (!content) return null
    return { key: s.key, label: s.label, content }
  }).filter(Boolean)

  return {
    locked: false,
    type,
    name: report.name,
    summary: report.summary,
    sections,
    dimensions: [
      { dim: 'E/I', letter: answer.ei, label: dimLabels[answer.ei], score: answer.ei_score },
      { dim: 'S/N', letter: answer.sn, label: dimLabels[answer.sn], score: answer.sn_score },
      { dim: 'T/F', letter: answer.tf, label: dimLabels[answer.tf], score: answer.tf_score },
      { dim: 'J/P', letter: answer.jp, label: dimLabels[answer.jp], score: answer.jp_score }
    ],
    created_at: answer.created_at
  }
}
