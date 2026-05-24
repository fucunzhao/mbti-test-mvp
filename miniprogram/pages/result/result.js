const TYPE_NAMES = {
  'INTJ':'建筑师','INTP':'逻辑学家','ENTJ':'指挥官','ENTP':'辩论家',
  'INFJ':'提倡者','INFP':'调停者','ENFJ':'主人公','ENFP':'竞选者',
  'ISTJ':'物流师','ISFJ':'守卫者','ESTJ':'总经理','ESFJ':'执政官',
  'ISTP':'鉴赏家','ISFP':'探险家','ESTP':'企业家','ESFP':'表演者'
}

const DIM_LABELS = {
  'E/I': { left: '外向·E', right: '内向·I' },
  'S/N': { left: '实感·S', right: '直觉·N' },
  'T/F': { left: '思考·T', right: '情感·F' },
  'J/P': { left: '计划·J', right: '随性·P' }
}

Page({
  data: {
    resultType: '',
    resultName: '',
    resultDesc: '',
    dimResults: [],
    isPaid: false,
    answerId: '',
    paying: false
  },

  onLoad(options) {
    const resultType = options.type || 'ENFP'
    const resultName = decodeURIComponent(options.name || '')
    const resultDesc = decodeURIComponent(options.desc || '')
    const answerId = options.answer_id || ''
    let dimResults = []
    try {
      dimResults = JSON.parse(decodeURIComponent(options.results || '[]'))
    } catch (e) {
      dimResults = []
    }

    // 构建带标签的结果
    const fullResults = dimResults.map(r => {
      const labels = DIM_LABELS[r.dim] || { left: '', right: '' }
      const isLeft = r.letter === labels.left.slice(-1)
      return {
        dim: r.dim,
        letter: r.letter,
        score: r.score,
        total: r.total,
        leftLabel: labels.left,
        rightLabel: labels.right,
        isLeft
      }
    })

    this.setData({
      resultType,
      resultName: '「' + resultName + '」',
      resultDesc,
      dimResults: fullResults,
      answerId
    })

    // 检查支付状态
    if (answerId) {
      this.checkPayment(answerId)
    }
  },

  checkPayment(answerId) {
    wx.cloud.callFunction({
      name: 'get-result',
      data: { answer_id: answerId }
    }).then(res => {
      if (res.result && (res.result.locked === false || res.result.is_paid)) {
        this.setData({ isPaid: true })
      }
    }).catch(() => {})
  },

  doPay() {
    if (this.data.paying) return
    if (!this.data.answerId) {
      wx.showToast({ title: '数据异常，请重新测试', icon: 'none' })
      return
    }

    this.setData({ paying: true })

    wx.cloud.callFunction({
      name: 'create-order',
      data: { answer_id: this.data.answerId }
    }).then(res => {
      const payParams = res.result && res.result.pay_params
      if (!payParams) {
        throw new Error('获取支付参数失败')
      }
      // 调起微信支付
      return wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign
      })
    }).then(() => {
      // 支付成功，拉取完整结果
      wx.showToast({ title: '支付成功', icon: 'success' })
      this.setData({ isPaid: true, paying: false })
    }).catch(err => {
      console.error('支付失败', err)
      this.setData({ paying: false })
      if (err.errMsg && err.errMsg.indexOf('cancel') > -1) {
        wx.showToast({ title: '已取消支付', icon: 'none' })
      } else {
        wx.showToast({ title: '支付失败，请重试', icon: 'none' })
      }
    })
  },

  goHome() {
    wx.redirectTo({ url: '/pages/index/index' })
  },

  shareResult() {
    wx.setClipboardData({
      data: `我刚做了MBTI人格测试，结果是 ${this.data.resultType} ${this.data.resultName} 🔮\n来测测你的性格类型吧！`,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  },

  onShareAppMessage() {
    return {
      title: `我测出是${this.data.resultType} ${this.data.resultName}，快来测测你的MBTI！`,
      path: '/pages/index/index'
    }
  }
})
