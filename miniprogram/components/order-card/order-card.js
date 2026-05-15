Component({
  properties: {
    order: { type: Object, value: {} },
  },
  data: {
    formattedTime: '',
  },
  observers: {
    'order'(order) {
      if (!order || !order.createdAt) return;
      const d = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
      if (isNaN(d.getTime())) return;
      const pad = n => String(n).padStart(2, '0');
      this.setData({
        formattedTime: `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      });
    },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { orderId: this.data.order._id });
    },
    onItemTap(e) {
      const { recipeId, orderId } = e.currentTarget.dataset;
      this.triggerEvent('itemtap', { recipeId, orderId });
    },
  },
});
