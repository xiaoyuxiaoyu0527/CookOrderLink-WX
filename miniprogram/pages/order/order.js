const { getCurrentUser, getFamilyRecipes } = require('../../utils/db');

Page({
  data: {
    recipes: [],
    selectedIds: [],
    selectedRecipes: {},
    totalCount: 0,
    totalMinutes: 0,
  },

  async onLoad() {
    try {
      this.user = await getCurrentUser();
      if (!this.user || !this.user.familyId) {
        wx.redirectTo({ url: '/pages/profile/profile' });
        return;
      }
      await this.loadData();
    } catch (err) {
      console.error('onLoad error:', err);
      wx.redirectTo({ url: '/pages/profile/profile' });
    }
  },

  async onShow() {
    if (!this.user || !this.user.familyId) return;
    await this.loadData();
  },

  async loadData() {
    if (!this.user || !this.user.familyId) return;
    const recipes = await getFamilyRecipes(this.user.familyId);
    this.setData({ recipes });
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

    wx.showToast({ title: '点菜成功', icon: 'success' });
    this.setData({ selectedIds: [], selectedRecipes: {}, totalCount: 0, totalMinutes: 0 });
  },
});
