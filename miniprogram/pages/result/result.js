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
    resultSummary: '',
    dimResults: [],
    isPaid: false,
    answerId: '',
    paying: false,

    // 报告数据
    sections: [],
    activeSection: 0,
    reportLoaded: false
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
        isLeft,
        pct: Math.round((r.score / r.total) * 100)
      }
    })

    this.setData({
      resultType,
      resultName: '「' + resultName + '」',
      resultDesc,
      dimResults: fullResults,
      answerId
    })

    // 检查支付状态并加载报告
    if (answerId) {
      this.checkPayment(answerId)
    }
  },

  /** 检查支付 + 拉取报告 */
  checkPayment(answerId) {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'get-result',
      data: { answer_id: answerId }
    }).then(res => {
      wx.hideLoading()
      const r = res.result
      if (!r) return

      if (r.locked === false || r.is_paid) {
        // 已付费 → 显示完整报告
        this.setData({
          isPaid: true,
          resultSummary: r.summary || '',
          reportLoaded: true,
          sections: r.sections || []
        })
      }
      // 未付费状态已有默认显示
    }).catch(() => {
      wx.hideLoading()
    })
  },

  /** 切换报告章节 */
  switchSection(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ activeSection: idx })
  },

  /** 支付 */
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
      if (!payParams) throw new Error('获取支付参数失败')
      return wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign
      })
    }).then(() => {
      wx.showToast({ title: '支付成功', icon: 'success' })
      this.setData({ isPaid: true, paying: false })
      // 重新加载报告
      this.checkPayment(this.data.answerId)
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

  /** 所有分享功能 */
  onShareAppMessage() {
    return {
      title: `我测出是${this.data.resultType} ${this.data.resultName}，快来测测你的MBTI性格！`,
      path: '/pages/index/index',
      imageUrl: '/images/share-card.png'
    }
  },

  /** 分享到朋友圈（竖屏图片） */
  onShareTimeline() {
    return {
      title: `我测出是${this.data.resultType} ${this.data.resultName} 🔮 你的性格类型是什么？`,
      query: ''
    }
  },

  /** 保存报告为图片（分享/发朋友圈/发邮件） */
  saveReportImage() {
    wx.showLoading({ title: '生成分享图...' })

    // 创建 Canvas 绘制分享图
    const query = wx.createSelectorQuery()
    query.select('#reportCanvas')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res || !res[0]) {
          wx.hideLoading()
          wx.showToast({ title: '生成失败', icon: 'none' })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        const width = 340 * dpr
        const height = 540 * dpr

        canvas.width = width
        canvas.height = height

        // 背景
        ctx.fillStyle = '#667eea'
        ctx.fillRect(0, 0, width, height)

        // 渐变卡片
        const grd = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.6)
        grd.addColorStop(0, 'rgba(255,255,255,0.15)')
        grd.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.roundRect(width * 0.06, height * 0.12, width * 0.88, height * 0.42, 20)
        ctx.fill()

        // 类型标题
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.font = `bold ${44 * dpr}px sans-serif`
        ctx.fillText(this.data.resultType, width / 2, height * 0.22)

        ctx.font = `bold ${24 * dpr}px sans-serif`
        ctx.fillText(this.data.resultName || '', width / 2, height * 0.31)

        // 类型中文名
        ctx.font = `${16 * dpr}px sans-serif`
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.fillText(TYPE_NAMES[this.data.resultType] || '', width / 2, height * 0.385)

        // 维度
        const dims = this.data.dimResults
        if (dims && dims.length > 0) {
          ctx.font = `${13 * dpr}px sans-serif`
          ctx.fillStyle = 'rgba(255,255,255,0.8)'
          const dimText = dims.map(d => d.letter).join('/')
          ctx.fillText(dimText + '  ' + dims.map(d => d.score + '/' + d.total).join('  '), width / 2, height * 0.455)
        }

        // 底部标题
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = `${13 * dpr}px sans-serif`
        ctx.fillText('MBTI故事测 · 扫码立即测试', width / 2, height * 0.88)

        // 小程序码提示
        ctx.font = `${11 * dpr}px sans-serif`
        ctx.fillText('长按识别小程序', width / 2, height * 0.94)

        // 导出
        wx.canvasToTempFilePath({
          canvas,
          fileType: 'jpg',
          quality: 0.9,
          success: r => {
            wx.hideLoading()
            this._doShareAction(r.tempFilePath)
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '生成失败', icon: 'none' })
          }
        })
      })
  },

  /** 分享操作选择 */
  _doShareAction(imagePath) {
    wx.showActionSheet({
      itemList: ['保存到相册', '分享给微信好友', '分享到朋友圈'],
      success: res => {
        switch (res.tapIndex) {
          case 0: // 保存到相册
            wx.saveImageToPhotosAlbum({
              filePath: imagePath,
              success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
              fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
            })
            break
          case 1: // 分享给好友（通过转发）
            this.setData({ shareImagePath: imagePath })
            // 通过图片消息转发
            wx.shareAppMessage({
              title: `我测出是${this.data.resultType} ${this.data.resultName}，快来测测！`,
              path: '/pages/index/index',
              imageUrl: imagePath
            })
            break
          case 2: // 分享到朋友圈
            // 使用 saveImageToPhotosAlbum，用户手动发朋友圈
            wx.saveImageToPhotosAlbum({
              filePath: imagePath,
              success: () => {
                wx.showToast({ title: '图片已保存，去朋友圈发布吧', icon: 'success', duration: 2000 })
              },
              fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
            })
            break
        }
      }
    })
  },

  goHome() {
    wx.redirectTo({ url: '/pages/index/index' })
  },

  /** 复制结果文字 */
  copyResult() {
    const text = `我做了MBTI性格测试，结果是 ${this.data.resultType} ${this.data.resultName} 🔮\n四个维度：${this.data.dimResults.map(d => d.dim + ' ' + d.letter + ' ' + d.score + '/' + d.total).join(' · ')}\n\n来测测你的性格类型吧！https://mbti-test-d3gjj6qb5c3c8981e-1318283307.tcloudbaseapp.com`
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制，去分享吧', icon: 'success' })
    })
  }
})
