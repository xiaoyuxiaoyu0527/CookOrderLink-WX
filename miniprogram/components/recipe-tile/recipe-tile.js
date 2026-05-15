Component({
  properties: {
    recipe: { type: Object, value: {} },
    selected: { type: Boolean, value: false },
    quantity: { type: Number, value: 1 },
    note: { type: String, value: '' },
  },
  methods: {
    onTap() {
      this.triggerEvent('toggle', { recipeId: this.data.recipe._id });
    },
    onIncrease() {
      this.triggerEvent('quantitychange', {
        recipeId: this.data.recipe._id,
        quantity: this.data.quantity + 1,
      });
    },
    onDecrease() {
      if (this.data.quantity <= 1) return;
      this.triggerEvent('quantitychange', {
        recipeId: this.data.recipe._id,
        quantity: this.data.quantity - 1,
      });
    },
    onNoteInput(e) {
      this.triggerEvent('notechange', {
        recipeId: this.data.recipe._id,
        note: e.detail.value,
      });
    },
    noop() {},
  },
});
