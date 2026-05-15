const { getCurrentUser, getFamilyOrders } = require('../../utils/db');

const STATUS_TABS = [
  { key: 'pending', label: '待做' },
  { key: 'done', label: '已完成' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeTab: 'pending',
    orders: [],
    filteredOrders: [],
  },

  async onLoad() {
    try {
      this.user = await getCurrentUser();
      if (!this.user || !this.user.familyId) {
        wx.redirectTo({ url: '/pages/profile/profile' });
        return;
      }
    } catch (err) {
      console.error('onLoad error:', err);
      wx.redirectTo({ url: '/pages/profile/profile' });
    }
  },

  async onShow() {
    if (!this.user || !this.user.familyId) return;
    await this.loadOrders();
  },

  async loadOrders() {
    const orders = await getFamilyOrders(this.user.familyId);
    this.setData({ orders });
    this.updateFilteredOrders();
  },

  updateFilteredOrders() {
    const filteredOrders = this.data.orders.filter(o => o.status === this.data.activeTab);
    this.setData({ filteredOrders });
  },

  onTabTap(e) {
    const activeTab = e.currentTarget.dataset.tab;
    const filteredOrders = this.data.orders.filter(o => o.status === activeTab);
    this.setData({ activeTab, filteredOrders });
  },

  onOrderTap(e) {
    const { orderId } = e.detail;
    const order = this.data.orders.find(o => o._id === orderId);
    if (!order) return;

    const firstRecipeId = order.items[0]?.recipeId;
    if (firstRecipeId) {
      wx.navigateTo({
        url: `/pages/recipe/detail?id=${firstRecipeId}&orderId=${orderId}`,
      });
    }
  },

  async onCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '完成订单',
      content: '确认已完成所有菜品？',
      success: async (res) => {
        if (res.confirm) {
          await wx.cloud.callFunction({
            name: 'updateOrderStatus',
            data: { orderId, status: 'done' },
          });
          wx.showToast({ title: '已完成', icon: 'success' });
          await this.loadOrders();
        }
      },
    });
  },
});
