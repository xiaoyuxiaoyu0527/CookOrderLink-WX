const { getCurrentUser, getFamilyOrders } = require('../../utils/db');

const STATUS_TABS = [
  { key: 'pending', label: '待做' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeTab: 'pending',
    orders: [],
    filteredOrders: [],
    pendingCount: 0,
    showCancelModal: false,
    cancelOrderId: '',
    cancelReason: '',
  },

  async onShow() {
    try {
      if (!this.user || !this.user.familyId) {
        this.user = await getCurrentUser();
      }
      if (!this.user || !this.user.familyId) {
        wx.redirectTo({ url: '/pages/profile/profile' });
        return;
      }
      await this.loadOrders();
    } catch (err) {
      console.error('onShow error:', err);
    }
  },

  async loadOrders() {
    try {
      const orders = await getFamilyOrders(this.user.familyId);
      this.setData({ orders });
      this.updateFilteredOrders();
    } catch (err) {
      console.error('loadOrders error:', err);
    }
  },

  updateFilteredOrders() {
    const filteredOrders = this.data.orders.filter(o => o.status === this.data.activeTab);
    const pendingCount = this.data.orders.filter(o => o.status === 'pending').length;
    const statusTabs = STATUS_TABS.map(t => ({
      ...t,
      count: this.data.orders.filter(o => o.status === t.key).length,
    }));
    this.setData({ filteredOrders, pendingCount, statusTabs });
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

  onItemTap(e) {
    const { recipeId, orderId } = e.detail;
    if (recipeId) {
      wx.navigateTo({
        url: `/pages/recipe/detail?id=${recipeId}&orderId=${orderId}`,
      });
    }
  },

  onCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '完成订单',
      content: '确认已完成所有菜品？',
      success: async (res) => {
        if (!res.confirm) return;
        const result = await wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: { orderId, newStatus: 'done' },
        });
        if (result.result && result.result.error) {
          wx.showToast({ title: result.result.error, icon: 'none' });
          return;
        }
        wx.showToast({ title: '已完成', icon: 'success' });
        const orders = this.data.orders.map(o =>
          o._id === orderId ? { ...o, status: 'done' } : o
        );
        this.setData({ orders });
        this.updateFilteredOrders();
      },
    });
  },

  onCompleteAll() {
    const pendingOrders = this.data.orders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) {
      wx.showToast({ title: '没有待做订单', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '一键完成',
      content: `确认完成全部 ${pendingOrders.length} 个订单？`,
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        const successIds = [];
        const errors = [];
        for (const order of pendingOrders) {
          try {
            const result = await wx.cloud.callFunction({
              name: 'updateOrderStatus',
              data: { orderId: order._id, newStatus: 'done' },
            });
            if (result.result && result.result.error) {
              errors.push(`${order.items.map(i => i.name).join('、')}: ${result.result.error}`);
            } else {
              successIds.push(order._id);
            }
          } catch (err) {
            errors.push(`${order.items.map(i => i.name).join('、')}: 网络错误`);
          }
        }
        wx.hideLoading();
        if (successIds.length > 0) {
          wx.showToast({ title: `已完成 ${successIds.length} 个`, icon: 'success' });
        }
        if (errors.length > 0) {
          wx.showModal({
            title: `${errors.length} 个订单完成失败`,
            content: errors.slice(0, 3).join('\n') + (errors.length > 3 ? '\n...' : ''),
            showCancel: false,
          });
        }
        const orders = this.data.orders.map(o =>
          successIds.includes(o._id) ? { ...o, status: 'done' } : o
        );
        this.setData({ orders });
        this.updateFilteredOrders();
      },
    });
  },

  onCancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    this.setData({ showCancelModal: true, cancelOrderId: orderId, cancelReason: '' });
  },

  onCancelReasonInput(e) {
    this.setData({ cancelReason: e.detail.value });
  },

  onCloseCancelModal() {
    this.setData({ showCancelModal: false, cancelOrderId: '', cancelReason: '' });
  },

  noop() {},

  onConfirmCancel() {
    const { cancelOrderId, cancelReason } = this.data;
    if (!cancelReason.trim()) {
      wx.showToast({ title: '请填写取消原因', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '取消订单',
      content: '确认取消此订单？',
      success: async (res) => {
        if (!res.confirm) return;
        const result = await wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: { orderId: cancelOrderId, newStatus: 'cancelled', cancelReason: cancelReason.trim() },
        });
        if (result.result.error) {
          wx.showToast({ title: result.result.error, icon: 'none' });
          return;
        }
        wx.showToast({ title: '已取消', icon: 'success' });
        const orders = this.data.orders.map(o =>
          o._id === cancelOrderId ? { ...o, status: 'cancelled', cancelReason: cancelReason.trim() } : o
        );
        const filteredOrders = orders.filter(o => o.status === 'cancelled');
        this.setData({ orders, filteredOrders, activeTab: 'cancelled', showCancelModal: false, cancelOrderId: '', cancelReason: '' });
      },
    });
  },
});
