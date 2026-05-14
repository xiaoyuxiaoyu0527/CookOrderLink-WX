Component({
  properties: {
    order: { type: Object, value: {} },
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { orderId: this.data.order._id });
    },
  },
});
