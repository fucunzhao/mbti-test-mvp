App({
  onLaunch() {
    wx.cloud.init({
      env: 'mbti-test-d3gjj6qb5c3c8981e'
    })
  },
  globalData: {
    userInfo: null,
    openid: null
  }
})
