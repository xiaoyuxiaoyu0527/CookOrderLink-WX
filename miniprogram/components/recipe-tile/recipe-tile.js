Component({
  properties: {
    recipe: { type: Object, value: {} },
    available: { type: Boolean, value: true },
    selected: { type: Boolean, value: false },
    missingIngredients: { type: Array, value: [] },
  },
  methods: {
    onTap() {
      if (!this.data.available) return;
      this.triggerEvent('toggle', { recipeId: this.data.recipe._id });
    },
    onNoteInput(e) {
      this.triggerEvent('notechange', {
        recipeId: this.data.recipe._id,
        note: e.detail.value,
      });
    },
  },
});
