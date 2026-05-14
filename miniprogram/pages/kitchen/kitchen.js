const { getCurrentUser, getFamilyOrders, getFamilyInventory } = require('../../utils/db');
const { calculateInventoryStatus } = require('../../utils/inventory');

const STATUS_TABS = [
  { key: 'pending', label: '待做' },
  { key: 'cooking', label: '做菜中' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeTab: 'pending',
    orders: [],
    filteredOrders: [],
    expiringCount: 0,
  },

  async onLoad() {
    this.user = await getCurrentUser();
    if (!this.user.familyId) {
      wx.redirectTo({ url: '/pages/profile/profile' });
      return;
    }
  },

  async onShow() {
    await this.loadOrders();
    await this.checkExpiring();
  },

  async loadOrders() {
    const orders = await getFamilyOrders(this.user.familyId);
    this.setData({ orders });
    this.updateFilteredOrders();
  },

  onTabTap(e) {
    const activeTab = e.currentTarget.dataset.tab;
    const filteredOrders = this.data.orders.filter(o => o.status === activeTab);
    this.setData({ activeTab, filteredOrders });
  },

  updateFilteredOrders() {
    const filteredOrders = this.data.orders.filter(o => o.status === this.data.activeTab);
    this.setData({ filteredOrders });
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

  async checkExpiring() {
    const inventory = await getFamilyInventory(this.user.familyId);
    const expiringCount = inventory.filter(i => {
      const status = calculateInventoryStatus(i);
      return status === 'expiring' || status === 'expired';
    }).length;
    this.setData({ expiringCount });
  },

  onGoInventory() {
    wx.navigateTo({ url: '/pages/inventory/list' });
  },
});
