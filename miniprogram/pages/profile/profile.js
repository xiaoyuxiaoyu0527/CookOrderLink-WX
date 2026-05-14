const { getCurrentUser, getCollection, COLLECTIONS } = require('../../utils/db');

Page({
  data: {
    userInfo: null,
    familyId: '',
    inviteCode: '',
    hasFamily: false,
    showJoinModal: false,
    joinCodeInput: '',
  },

  async onLoad() {
    const userInfo = await getCurrentUser();
    this.setData({ userInfo, hasFamily: !!userInfo.familyId, familyId: userInfo.familyId });

    if (userInfo.familyId) {
      const familyRes = await getCollection(COLLECTIONS.FAMILIES).doc(userInfo.familyId).get();
      this.setData({ inviteCode: familyRes.data.inviteCode });
    }
  },

  async onCreateFamily() {
    const res = await wx.cloud.callFunction({ name: 'createFamily' });
    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }
    this.setData({
      familyId: res.result.familyId,
      inviteCode: res.result.inviteCode,
      hasFamily: true,
    });
    getApp().globalData.familyId = res.result.familyId;
    wx.showToast({ title: '创建成功', icon: 'success' });
  },

  onShowJoinModal() {
    this.setData({ showJoinModal: true });
  },

  onJoinCodeInput(e) {
    this.setData({ joinCodeInput: e.detail.value });
  },

  async onJoinFamily() {
    const code = this.data.joinCodeInput.trim();
    if (!code) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    const res = await wx.cloud.callFunction({ name: 'joinFamily', data: { inviteCode: code } });
    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }
    this.setData({
      familyId: res.result.familyId,
      hasFamily: true,
      showJoinModal: false,
    });
    getApp().globalData.familyId = res.result.familyId;
    wx.showToast({ title: '加入成功', icon: 'success' });
  },

  onCloseModal() {
    this.setData({ showJoinModal: false });
  },

  noop() {},

  onInputFocus() {
    // Prevent modal from closing when input is focused
  },

  onCopyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
    });
  },

  async onToggleReminder(e) {
    const enabled = e.detail.value;
    if (enabled) {
      wx.requestSubscribeMessage({
        tmplIds: ['Rk2sodg0GmD20fL0Ve30oJ3HI8m-_qjH36zqJs_rj9g'],
        success: async () => {
          await getCollection(COLLECTIONS.USERS).doc(this.data.userInfo._id).update({
            data: { subscribeExpireReminder: true },
          });
          this.setData({ 'userInfo.subscribeExpireReminder': true });
          wx.showToast({ title: '已开启提醒', icon: 'success' });
        },
        fail: () => {
          this.setData({ 'userInfo.subscribeExpireReminder': false });
        },
      });
    } else {
      await getCollection(COLLECTIONS.USERS).doc(this.data.userInfo._id).update({
        data: { subscribeExpireReminder: false },
      });
      this.setData({ 'userInfo.subscribeExpireReminder': false });
      wx.showToast({ title: '已关闭提醒', icon: 'success' });
    }
  },

  async onSeedRecipes() {
    if (!this.data.hasFamily) {
      wx.showToast({ title: '请先创建家庭组', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '添加菜谱...' });
    const { seedRecipes } = require('../../utils/seed-recipes');
    await seedRecipes(this.data.familyId, this.data.userInfo._id);
    wx.hideLoading();
    wx.showToast({ title: '已添加菜谱', icon: 'success' });
  },
});
