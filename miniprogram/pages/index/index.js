const TYPE_NAMES = {
  'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
  'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
  'ISTJ': '物流师', 'ISFJ': '守卫者', 'ESTJ': '总经理', 'ESFJ': '执政官',
  'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '表演者'
}

Page({
  data: {
    records: [],
    loggedIn: false
  },

  onLoad() {
    this.loadRecords()
    this.doLogin()
  },

  onShow() {
    this.loadRecords()
  },

  loadRecords() {
    const records = wx.getStorageSync('mbti-records') || []
    this.setData({ records })
  },

  doLogin() {
    wx.showLoading({ title: '登录中...' })
    wx.cloud.callFunction({
      name: 'wx-login',
      data: {}
    }).then(res => {
      const openid = res.result.openid
      if (openid) {
        wx.setStorageSync('openid', openid)
        this.setData({ loggedIn: true })
      }
      wx.hideLoading()
    }).catch(err => {
      console.error('登录失败', err)
      wx.hideLoading()
      wx.showToast({ title: '登录失败', icon: 'none' })
    })
  },

  startQuick() {
    this.startTest('quick')
  },

  startFull() {
    this.startTest('full')
  },

  startTest(mode) {
    if (!this.data.loggedIn) {
      wx.showToast({ title: '正在登录，请稍候...', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: `/pages/test/test?mode=${mode}`
    })
  }
})
