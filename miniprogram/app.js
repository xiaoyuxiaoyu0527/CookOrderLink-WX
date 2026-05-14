App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-d0grs4ijica9a6dae', // replace with your env id
      traceUser: true,
    });
    this.login();
  },

  async login() {
    try {
      const res = await wx.cloud.callFunction({ name: 'userLogin' });
      this.globalData.userInfo = res.result.userInfo;
      this.globalData.familyId = res.result.userInfo.familyId;
    } catch (err) {
      console.error('登录失败', err);
    }
  },

  globalData: {
    userInfo: null,
    familyId: null,
  },
});
