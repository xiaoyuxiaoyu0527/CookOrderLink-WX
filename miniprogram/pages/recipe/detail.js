const { getCollection, COLLECTIONS } = require('../../utils/db');

Page({
  data: {
    recipe: null,
    orderId: '',
    orderStatus: '',
    canStartCooking: false,
    canCompleteCooking: false,
  },

  async onLoad(options) {
    const { id, orderId } = options;
    await this.loadRecipe(id);
    if (orderId) {
      await this.loadOrder(orderId);
    }
  },

  async loadRecipe(id) {
    const res = await getCollection(COLLECTIONS.RECIPES).doc(id).get();
    this.setData({ recipe: res.data });
  },

  async loadOrder(orderId) {
    const res = await getCollection(COLLECTIONS.ORDERS).doc(orderId).get();
    const order = res.data;
    this.setData({
      orderId,
      orderStatus: order.status,
      canStartCooking: order.status === 'pending',
      canCompleteCooking: order.status === 'cooking',
    });
  },

  async onStartCooking() {
    wx.showLoading({ title: '处理中...' });
    const res = await wx.cloud.callFunction({
      name: 'updateOrderStatus',
      data: { orderId: this.data.orderId, newStatus: 'cooking' },
    });
    wx.hideLoading();

    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }

    this.setData({ orderStatus: 'cooking', canStartCooking: false, canCompleteCooking: true });
    wx.showToast({ title: '开始做菜', icon: 'success' });
  },

  async onCompleteCooking() {
    wx.showModal({
      title: '完成做菜',
      content: '确认完成？系统将自动扣减库存。',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        const result = await wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: { orderId: this.data.orderId, newStatus: 'done' },
        });
        wx.hideLoading();

        if (result.result.error) {
          wx.showToast({ title: result.result.error, icon: 'none' });
          return;
        }

        this.setData({ orderStatus: 'done', canCompleteCooking: false });
        wx.showToast({ title: '做菜完成', icon: 'success' });
      },
    });
  },

  onBackToKitchen() {
    wx.navigateBack();
  },
});
