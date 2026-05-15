const { getCurrentUser, getCollection, COLLECTIONS } = require('../../utils/db');

Page({
  data: {
    recipe: null,
    orderId: '',
  },

  async onLoad(options) {
    try {
      this.user = await getCurrentUser();
      if (options.id) {
        await this.loadRecipe(options.id);
      }
      if (options.orderId) {
        this.setData({ orderId: options.orderId });
      }
    } catch (err) {
      console.error('onLoad error:', err);
    }
  },

  async loadRecipe(id) {
    const res = await getCollection(COLLECTIONS.RECIPES).doc(id).get();
    this.setData({ recipe: res.data });
  },

  onOpenTutorial(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({ title: '链接已复制，请在浏览器中打开', icon: 'none' });
        },
      });
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
