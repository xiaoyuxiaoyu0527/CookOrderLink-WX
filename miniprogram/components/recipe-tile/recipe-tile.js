Component({
  properties: {
    recipe: { type: Object, value: {} },
    selected: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
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
