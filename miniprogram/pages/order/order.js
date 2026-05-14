const { getCurrentUser, getFamilyRecipes, getFamilyInventory } = require('../../utils/db');
const { checkRecipeAvailability } = require('../../utils/inventory');

Page({
  data: {
    recipes: [],
    selectedIds: [],
    selectedRecipes: {},
    totalCount: 0,
    totalMinutes: 0,
  },

  async onLoad() {
    this.user = await getCurrentUser();
    if (!this.user.familyId) {
      wx.redirectTo({ url: '/pages/profile/profile' });
      return;
    }
    await this.loadData();
  },

  async onShow() {
    await this.loadData();
  },

  async loadData() {
    const [recipes, inventory] = await Promise.all([
      getFamilyRecipes(this.user.familyId),
      getFamilyInventory(this.user.familyId),
    ]);

    const enriched = recipes.map(recipe => {
      const { available, missing } = checkRecipeAvailability(recipe, inventory);
      return { ...recipe, available, missingIngredients: missing };
    });

    this.setData({ recipes: enriched });
  },

  onToggleRecipe(e) {
    const { recipeId } = e.detail;
    const selectedIds = [...this.data.selectedIds];
    const selectedRecipes = { ...this.data.selectedRecipes };
    const idx = selectedIds.indexOf(recipeId);

    if (idx >= 0) {
      selectedIds.splice(idx, 1);
      delete selectedRecipes[recipeId];
    } else {
      selectedIds.push(recipeId);
      selectedRecipes[recipeId] = { note: '' };
    }

    const selected = this.data.recipes.filter(r => selectedIds.includes(r._id));
    const totalMinutes = selected.reduce((sum, r) => sum + (r.estimatedMinutes || 0), 0);

    this.setData({
      selectedIds,
      selectedRecipes,
      totalCount: selectedIds.length,
      totalMinutes,
    });
  },

  onNoteChange(e) {
    const { recipeId, note } = e.detail;
    const selectedRecipes = { ...this.data.selectedRecipes };
    if (selectedRecipes[recipeId]) {
      selectedRecipes[recipeId] = { ...selectedRecipes[recipeId], note };
    }
    this.setData({ selectedRecipes });
  },

  async onSubmitOrder() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请先选择菜品', icon: 'none' });
      return;
    }

    const items = this.data.selectedIds.map(id => {
      const recipe = this.data.recipes.find(r => r._id === id);
      return {
        recipeId: id,
        name: recipe.name,
        quantity: 1,
        note: this.data.selectedRecipes[id]?.note || '',
      };
    });

    wx.showLoading({ title: '提交中...' });
    const res = await wx.cloud.callFunction({
      name: 'createOrder',
      data: { items },
    });
    wx.hideLoading();

    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }

    // Request subscribe message authorization for order notifications
    wx.requestSubscribeMessage({
      tmplIds: ['zIoRVqR89IsQSbh2D27EtprZ8TUd-q_tDXY7gbD03r4'],
      complete: () => {
        wx.showToast({ title: '点菜成功', icon: 'success' });
        this.setData({ selectedIds: [], selectedRecipes: {}, totalCount: 0, totalMinutes: 0 });
      },
    });
  },
});
