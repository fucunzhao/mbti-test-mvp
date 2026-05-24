const ALL_QUESTIONS = [
  // ===== E/I 维度（0-20题）=====
  ...[
    {q:'同事生日聚餐。下班后你走进包厢——',a:'自然地坐到中间，主动张罗点菜倒酒',b:'选个靠边的位置，和旁边一两个人聊'},
    {q:'周五下午六点，最难的项目终于交付了——',a:'约朋友出来喝一杯，聊聊这周的事',b:'终于可以一个人待着了，回家追剧'},
    {q:'搬到新城市第一个周末——',a:'主动参加线下聚会认识新朋友',b:'自己出去逛逛，一个人探店也舒服'},
    {q:'想学摄影怎么入门——',a:'报线下班，和同学们一起拍一起讨论',b:'在B站找教程，自己出门慢慢练'},
    {q:'部门开会讨论新方案——',a:'想到什么直接说，话比较多',b:'全程听着，到最后才说一两句'},
    {q:'周六早上没有任何安排——',a:'约朋友出去玩，一整天热热闹闹',b:'睡到自然醒，一个人看书打游戏'},
    {q:'参加社交聚会——',a:'和很多人聊得开',b:'只和少数熟人有深度交流'},
    {q:'在大超市里迷路了——',a:'直接找人问路',b:'自己看指示牌慢慢找'},
    {q:'假期理想的状态——',a:'参加多人活动，热闹有趣',b:'安静独处，按自己节奏来'},
    {q:'有人发微信聊心事——',a:'直接打电话过去聊',b:'发文字慢慢回'},
    {q:'工作中遇到不懂的——',a:'立刻问旁边的同事',b:'先自己查资料琢磨'},
    {q:'参加一个陌生人占多数的聚餐——',a:'很快就和大家聊起来',b:'全程比较安静'},
    {q:'朋友圈发了一条动态，很多人评论——',a:'每条都回复互动',b:'看一下就过了'},
    {q:'工作累了想放松——',a:'找人聊天或聚餐',b:'一个人散步或听音乐'},
    {q:'周末和几个朋友在咖啡馆——',a:'一直说话的那个',b:'一直听的那个'},
    {q:'你的手机通讯录——',a:'联系人很多',b:'精简，只留真正的朋友'},
    {q:'和一群不太熟的人团建——',a:'主动活跃气氛',b:'比较安静，等别人主动'},
    {q:'你到一个新环境——',a:'很快交到新朋友',b:'需要比较长时间才熟'},
    {q:'你对社交的看法——',a:'社交给我能量',b:'社交消耗我的能量'},
    {q:'你更喜欢的工作方式——',a:'团队协作，密切沟通',b:'独立完成，自己掌控'},
    {q:'别人对你的评价更接近——',a:'外向开朗',b:'安静内敛'},
  ].map((q,i)=>({dim:'E/I',idx:i,...q})),

  // ===== S/N 维度（21-46题）=====
  ...[
    {q:'给朋友指路——',a:'A路口左转过两个红绿灯右转',b:'那个大公园旁边的楼就是'},
    {q:'去书店更爱逛哪个区——',a:'实用技能区（烹饪/理财/摄影）',b:'文学/科幻/哲学区'},
    {q:'描述刚看的电影——',a:'先说剧情梗概',b:'先说感觉和寓意'},
    {q:'看现代艺术展——',a:'认真看每件作品的说明牌',b:'感受整体氛围'},
    {q:'朋友给你看新手机——',a:'先问参数配置',b:'先问有什么新玩法'},
    {q:'做饭时——',a:'严格按菜谱来',b:'凭感觉发挥'},
    {q:'去旅行更看重——',a:'舒适的住宿和美食',b:'独特的体验和故事'},
    {q:'看新闻更喜欢——',a:'事实报道和数据',b:'深度分析和观点'},
    {q:'回忆一件事——',a:'记得具体细节',b:'记得当时的感觉'},
    {q:'跟朋友讲昨天的事——',a:'按时间线讲发生了什么',b:'讲你觉得有意思的点'},
    {q:'你对文字的偏好——',a:'清晰直接的表达',b:'有想象力的表达'},
    {q:'装修房间——',a:'实用至上，好打扫',b:'要有格调和氛围'},
    {q:'听一首新歌——',a:'先看歌词写了什么',b:'感受旋律和情绪'},
    {q:'你更常被人说——',a:'实际、落地',b:'有想法、有创意'},
    {q:'选一本杂志——',a:'国家地理（真实世界）',b:'科幻世界（可能性界）'},
    {q:'老师讲一个概念——',a:'希望先讲定义和事实',b:'希望先讲应用和意义'},
    {q:'你更容易记住——',a:'人脸',b:'名字'},
    {q:'买衣服更看重——',a:'面料、做工、实穿性',b:'设计感、独特性'},
    {q:'你相信的判断依据——',a:'亲身经历和具体数据',b:'直觉和第六感'},
    {q:'形容一棵树——',a:'梧桐树，高约15米，叶子掌形',b:'一棵苍劲的老树，有种沉静的力量'},
    {q:'你对变化的看法——',a:'倾向于稳定、可预测',b:'拥抱新可能'},
    {q:'你做事的风格——',a:'按已有经验稳妥来',b:'不断尝试新方法'},
    {q:'你跟人聊天——',a:'聊具体发生的事',b:'聊想法和可能性'},
    {q:'你更喜欢看的视频——',a:'纪录片、教程',b:'科幻片、奇幻片'},
    {q:'你的备忘录里——',a:'购物清单、待办事项',b:'灵感片段、想做的事'},
    {q:'你觉得最有价值的知识——',a:'能直接用的技能',b:'能打开新视野的思想'},
  ].map((q,i)=>({dim:'S/N',idx:i,...q})),

  // ===== T/F 维度（47-70题）=====
  ...[
    {q:'朋友失恋找你哭诉——',a:'帮他分析问题在哪',b:'陪他难过，一起骂'},
    {q:'两个offer：A薪高但严肃，B薪低但氛围好——',a:'选A，发展更重要',b:'选B，开心最重要'},
    {q:'下属交的报告很差——',a:'直接说哪里不行，让改',b:'先肯定再委婉建议'},
    {q:'选优秀员工：A业绩第一但难相处，B中上但人缘好——',a:'投A，公平优先',b:'投B，和谐优先'},
    {q:'网购衣服不满意退货麻烦——',a:'果断退',b:'算了将就穿'},
    {q:'群里吵起来了——',a:'看哪边逻辑严密就支持',b:'出来打圆场'},
    {q:'朋友想做你不同意的决定——',a:'直接说你的反对理由',b:'怕伤感情，委婉说'},
    {q:'公司裁员你怎么决定裁谁——',a:'按业绩和能力排',b:'考虑员工家庭情况'},
    {q:'你更看重朋友的什么品质——',a:'诚实、靠谱',b:'温柔、体贴'},
    {q:'你做的决定更多基于——',a:'逻辑分析',b:'内心感受'},
    {q:'你和人争论时——',a:'就事论事，直接交锋',b:'注意语气，不想伤关系'},
    {q:'你更讨厌哪种人——',a:'不讲逻辑的人',b:'冷漠无情的人'},
    {q:'被批评了你的第一反应——',a:'看他说得有没有道理',b:'觉得难过或委屈'},
    {q:'看到虐心的社会新闻——',a:'思考问题的根源',b:'觉得很难过'},
    {q:'你更倾向于——',a:'坚持原则',b:'照顾人情'},
    {q:'安排任务你会怎么分——',a:'按能力分配最合理的',b:'考虑每个人的意愿'},
    {q:'你做的选择更偏向——',a:'正确的选择',b:'让自己心安的选择'},
    {q:'跟朋友AA算账——',a:'精确到每个人多少',b:'大概差不多就行'},
    {q:'帮朋友分析感情问题——',a:'客观分析双方对错',b:'支持朋友的情绪'},
    {q:'竞争与合作——',a:'竞争促进进步',b:'合作更重要'},
    {q:'你对公平的理解——',a:'一视同仁是公平',b:'照顾弱者才是公平'},
    {q:'你更在意别人的看法——',a:'不太在意',b:'比较在意'},
    {q:'你对规则的态度——',a:'规则就是规则',b:'规则要有人情味'},
    {q:'你更希望别人说你——',a:'做事靠谱',b:'为人贴心'},
  ].map((q,i)=>({dim:'T/F',idx:i,...q})),

  // ===== J/P 维度（71-92题）=====
  ...[
    {q:'下周五有三天假——',a:'行程已经排好了',b:'到时候再说'},
    {q:'同事路过你的工位——',a:'整洁有序',b:'堆了不少但心里有数'},
    {q:'下周一要汇报——',a:'今天就开始做',b:'周日晚上效率最高'},
    {q:'跟朋友约饭——',a:'周六晚7点XX餐厅已订位',b:'周六有空吗到时候看'},
    {q:'旅行最后一天4点飞机——',a:'早早收拾好提前到机场',b:'掐着点到'},
    {q:'买了新电器——',a:'先看说明书再用',b:'直接用了再说'},
    {q:'衣柜什么样——',a:'分类挂好摆放整齐',b:'塞得进去就行'},
    {q:'你更喜欢哪种工作节奏——',a:'先规划再执行',b:'边做边调整'},
    {q:'你更习惯——',a:'先做完再休息',b:'边做边休息'},
    {q:'你的生活更像——',a:'有明确的日程表',b:'随性自由'},
    {q:'交作业/报告——',a:'通常会提前交',b:'通常在截止前交'},
    {q:'你对不确定性的态度——',a:'不喜欢，想尽早确定',b:'可以接受，随遇而安'},
    {q:'整理房间的频率——',a:'定期整理',b:'实在看不下去了才整'},
    {q:'你更欣赏哪种人——',a:'有条理的人',b:'随性洒脱的人'},
    {q:'你的笔记——',a:'有系统有分类',b:'散乱但自己能找'},
    {q:'决定去哪吃饭——',a:'想好了去',b:'到了再说'},
    {q:'周末的计划——',a:'心里大概有谱',b:'完全不做计划'},
    {q:'你更喜欢的生活方式——',a:'有序可控',b:'自由灵活'},
    {q:'你对待deadline的态度——',a:'提前完成',b:'踩着线完成'},
    {q:'你更倾向于——',a:'做完一件再做下一件',b:'几件事同时进行'},
    {q:'你买的东西——',a:'大多是计划内要买的',b:'很多是临时起意买的'},
    {q:'你的旅行风格——',a:'攻略党',b:'随性派'},
  ].map((q,i)=>({dim:'J/P',idx:i,...q}))
]

const QUICK_INDICES = [0,1,2,3,4,5, 21,22,23,24,25,26, 47,48,49,50,51,52, 71,72,73,74,75,76]

const TYPE_NAMES = {
  'INTJ':'建筑师','INTP':'逻辑学家','ENTJ':'指挥官','ENTP':'辩论家',
  'INFJ':'提倡者','INFP':'调停者','ENFJ':'主人公','ENFP':'竞选者',
  'ISTJ':'物流师','ISFJ':'守卫者','ESTJ':'总经理','ESFJ':'执政官',
  'ISTP':'鉴赏家','ISFP':'探险家','ESTP':'企业家','ESFP':'表演者'
}

const TYPE_DESCS = {
  'INTJ':'你有远见且独立，习惯用逻辑规划一切。你喜欢深入思考，相信周密计划胜过运气的青睐。能力是你唯一的通行证。',
  'INTP':'你喜欢探索一切事物的底层逻辑。看起来安静，脑子里却在不停运转。你在意的不是答案，而是问题本身是否成立。',
  'ENTJ':'你天生有领导力，目标明确、行动果断。你看重效率和结果，不喜欢含糊其辞。在你的字典里，没有解决不了的问题。',
  'ENTP':'你思维敏捷，喜欢挑战一切既有的东西。辩论是你的本能——不是抬杠，而是享受思维碰撞的火花。',
  'INFJ':'你有深刻的洞察力和强烈的理想主义。你能敏锐察觉别人的情绪，同时坚定地守护自己的原则。你温和的外表下，有一颗极有力量的心。',
  'INFP':'你是一个理想主义者。外表安静，内心丰富。你相信真善美，愿意为了信念默默努力。你的温柔，是一种有底气的力量。',
  'ENFJ':'你有天然的感染力，善于鼓舞和凝聚他人。你能看见每个人的闪光点，并愿意帮他们成为更好的自己。你是天生的引领者。',
  'ENFP':'你充满热情和创造力，对世界永远保持好奇。你喜欢和人打交道，总能发现有趣的人和事。你的生命力会感染每一个人。',
  'ISTJ':'你可靠、务实、信守承诺。你相信规则和秩序，做事一丝不苟。你是团队里最稳的那根柱子，大家有事都会来找你。',
  'ISFJ':'你温柔而可靠，默默守护着你在意的人和事。你不喜欢出风头，但总在别人需要的时候出现。你的体贴藏在每一个细节里。',
  'ESTJ':'你讲究效率和执行力，信服事实和结果。你善于组织和统筹，是天生的管理者。你看重公平，也愿意承担责任。',
  'ESFJ':'你热心、负责任、注重人际关系。你喜欢把一切安排得井井有条，也乐于照顾身边的人。大家一起好才是真的好。',
  'ISTP':'你动手能力强，遇事冷静不慌乱。你喜欢搞清楚事物的原理，也乐于拆解和重组。你是关键时刻最可靠的那个人。',
  'ISFP':'你随和而安静，以自己的节奏感受世界。你对美有独特的感知力，喜欢通过行动而非言语表达内心。你有自己的步调。',
  'ESTP':'你行动力爆棚，反应快、敢冒险。你喜欢活在当下，碰到问题就立刻上手解决。你是团队里那个说干就干的人。',
  'ESFP':'你开朗活泼，乐于成为人群中的焦点。你喜欢新鲜刺激的体验，也懂得享受当下。和你在一起永远不会无聊。'
}

const DIM_COLORS = { 'E/I':'dim-ei', 'S/N':'dim-sn', 'T/F':'dim-tf', 'J/P':'dim-jp' }
const DIM_LABELS = { 'E/I':'充电方式', 'S/N':'感知世界', 'T/F':'决策方式', 'J/P':'生活态度' }
const DIM_KEYS = ['E/I', 'S/N', 'T/F', 'J/P']

Page({
  data: {
    questions: [],
    current: 0,
    answers: [],
    totalQuestions: 0,
    storyText: '',
    optA: '',
    optB: '',
    selected: null,
    dimText: '',
    dimClass: '',
    canNext: false,
    isLast: false,
    answeredCount: 0,
    mode: 'quick'
  },

  onLoad(options) {
    const mode = options.mode || 'quick'
    const questions = mode === 'quick'
      ? QUICK_INDICES.map(i => ALL_QUESTIONS[i])
      : ALL_QUESTIONS.slice()
    const answers = new Array(questions.length).fill(null)
    this.setData({ mode, questions, answers, totalQuestions: questions.length })
    this.renderQuestion(0)
  },

  renderQuestion(index) {
    const q = this.data.questions[index]
    const done = this.data.answers.filter(x => x !== null).length
    let dimText = '维度 ' + q.dim + ' ' + (DIM_LABELS[q.dim] || '')
    this.setData({
      current: index,
      storyText: q.q || q.question,
      optA: q.a,
      optB: q.b,
      selected: this.data.answers[index],
      dimText,
      dimClass: DIM_COLORS[q.dim] || '',
      canNext: this.data.answers[index] !== null,
      isLast: index === this.data.totalQuestions - 1,
      answeredCount: done
    })
  },

  selectA() { this.selectOpt('a') },
  selectB() { this.selectOpt('b') },

  selectOpt(val) {
    const key = 'answers[' + this.data.current + ']'
    const answers = this.data.answers
    answers[this.data.current] = val
    this.setData({ [key]: val, selected: val, canNext: true })
  },

  prevQuestion() {
    if (this.data.current > 0) {
      this.renderQuestion(this.data.current - 1)
    }
  },

  nextQuestion() {
    if (!this.data.canNext) return
    if (this.data.current < this.data.totalQuestions - 1) {
      this.renderQuestion(this.data.current + 1)
    } else {
      this.submitResult()
    }
  },

  submitResult() {
    wx.showLoading({ title: '计算中...' })
    const { questions, answers, mode } = this.data

    // 本地计算结果
    function getDimIndices(dim) {
      return questions.map((q, i) => q.dim === dim ? i : -1).filter(i => i >= 0)
    }

    const dimConfig = [
      { key: 'E', dim: 'E/I', letters: ['E', 'I'] },
      { key: 'S', dim: 'S/N', letters: ['S', 'N'] },
      { key: 'T', dim: 'T/F', letters: ['T', 'F'] },
      { key: 'J', dim: 'J/P', letters: ['J', 'P'] }
    ]

    const results = dimConfig.map(d => {
      const idxes = getDimIndices(d.dim)
      const threshold = Math.ceil(idxes.length / 2)
      const aCount = idxes.filter(i => answers[i] === 'a').length
      const isA = aCount >= threshold
      const letter = isA ? d.letters[0] : d.letters[1]
      const score = isA ? aCount : idxes.length - aCount
      return {
        dim: d.dim,
        letter,
        score,
        total: idxes.length
      }
    })

    const type = results.map(r => r.letter).join('')
    const typeName = TYPE_NAMES[type] || ''
    const typeDesc = TYPE_DESCS[type] || '探索你的性格类型。'
    const dimResult = {}
    results.forEach(r => { dimResult[r.dim] = r.letter })

    // 保存到本地记录
    const records = wx.getStorageSync('mbti-records') || []
    records.unshift({
      type, name: typeName, mode,
      ei: dimResult['E/I'], sn: dimResult['S/N'],
      tf: dimResult['T/F'], jp: dimResult['J/P'],
      time: new Date().toLocaleString()
    })
    if (records.length > 50) records.length = 50
    wx.setStorageSync('mbti-records', records)

    // 调用云函数保存
    wx.cloud.callFunction({
      name: 'submit-answers',
      data: { mode, answers }
    }).then(res => {
      wx.hideLoading()
      const answerId = res.result && res.result.answer_id
      wx.redirectTo({
        url: `/pages/result/result?type=${type}&name=${encodeURIComponent(typeName)}&desc=${encodeURIComponent(typeDesc)}&results=${encodeURIComponent(JSON.stringify(results))}&answer_id=${answerId || ''}`
      })
    }).catch(err => {
      wx.hideLoading()
      // 云函数失败时，仍然显示本地结果
      wx.redirectTo({
        url: `/pages/result/result?type=${type}&name=${encodeURIComponent(typeName)}&desc=${encodeURIComponent(typeDesc)}&results=${encodeURIComponent(JSON.stringify(results))}&answer_id=`
      })
    })
  }
})
