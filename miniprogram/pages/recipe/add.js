const { getCurrentUser, getCollection, COLLECTIONS } = require('../../utils/db');

const CATEGORIES = ['家常菜', '荤菜', '素菜', '汤品', '主食'];
const DIFFICULTIES = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

Page({
  data: {
    name: '',
    description: '',
    category: '',
    difficulty: 'easy',
    estimatedMinutes: '',
    ingredients: [{ name: '', amount: '', unit: '个' }],
    steps: [{ desc: '', tips: '' }],
    tutorials: [],
    categories: CATEGORIES,
    difficulties: DIFFICULTIES,
  },

  async onLoad() {
    this.user = await getCurrentUser();
  },

  onInputName(e) { this.setData({ name: e.detail.value }); },
  onInputDesc(e) { this.setData({ description: e.detail.value }); },
  onSelectCategory(e) { this.setData({ category: CATEGORIES[e.detail.value] }); },
  onSelectDifficulty(e) { this.setData({ difficulty: DIFFICULTIES[e.detail.value].value }); },
  onInputMinutes(e) { this.setData({ estimatedMinutes: e.detail.value }); },

  // Ingredients
  onAddIngredient() {
    const ingredients = [...this.data.ingredients, { name: '', amount: '', unit: '个' }];
    this.setData({ ingredients });
  },
  onRemoveIngredient(e) {
    const idx = e.currentTarget.dataset.idx;
    const ingredients = this.data.ingredients.filter((_, i) => i !== idx);
    this.setData({ ingredients });
  },
  onInputIngredientName(e) {
    const idx = e.currentTarget.dataset.idx;
    const ingredients = [...this.data.ingredients];
    ingredients[idx].name = e.detail.value;
    this.setData({ ingredients });
  },
  onInputIngredientAmount(e) {
    const idx = e.currentTarget.dataset.idx;
    const ingredients = [...this.data.ingredients];
    ingredients[idx].amount = e.detail.value;
    this.setData({ ingredients });
  },
  onInputIngredientUnit(e) {
    const idx = e.currentTarget.dataset.idx;
    const ingredients = [...this.data.ingredients];
    ingredients[idx].unit = e.detail.value;
    this.setData({ ingredients });
  },

  // Steps
  onAddStep() {
    const steps = [...this.data.steps, { desc: '', tips: '' }];
    this.setData({ steps });
  },
  onRemoveStep(e) {
    const idx = e.currentTarget.dataset.idx;
    const steps = this.data.steps.filter((_, i) => i !== idx);
    this.setData({ steps });
  },
  onInputStepDesc(e) {
    const idx = e.currentTarget.dataset.idx;
    const steps = [...this.data.steps];
    steps[idx].desc = e.detail.value;
    this.setData({ steps });
  },
  onInputStepTips(e) {
    const idx = e.currentTarget.dataset.idx;
    const steps = [...this.data.steps];
    steps[idx].tips = e.detail.value;
    this.setData({ steps });
  },

  // Tutorials
  onAddTutorial() {
    const tutorials = [...this.data.tutorials, { platform: 'bilibili', title: '', url: '' }];
    this.setData({ tutorials });
  },
  onRemoveTutorial(e) {
    const idx = e.currentTarget.dataset.idx;
    const tutorials = this.data.tutorials.filter((_, i) => i !== idx);
    this.setData({ tutorials });
  },
  onSelectTutorialPlatform(e) {
    const idx = e.currentTarget.dataset.idx;
    const platforms = ['bilibili', 'xiaohongshu'];
    const tutorials = [...this.data.tutorials];
    tutorials[idx].platform = platforms[e.detail.value];
    this.setData({ tutorials });
  },
  onInputTutorialTitle(e) {
    const idx = e.currentTarget.dataset.idx;
    const tutorials = [...this.data.tutorials];
    tutorials[idx].title = e.detail.value;
    this.setData({ tutorials });
  },
  onInputTutorialUrl(e) {
    const idx = e.currentTarget.dataset.idx;
    const tutorials = [...this.data.tutorials];
    tutorials[idx].url = e.detail.value;
    this.setData({ tutorials });
  },

  async onSave() {
    const { name, description, category, difficulty, estimatedMinutes, ingredients, steps, tutorials } = this.data;

    if (!name.trim()) {
      wx.showToast({ title: '请输入菜品名称', icon: 'none' });
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.desc.trim());

    if (validIngredients.length === 0) {
      wx.showToast({ title: '请至少添加一个食材', icon: 'none' });
      return;
    }

    if (validSteps.length === 0) {
      wx.showToast({ title: '请至少添加一个步骤', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'createRecipe',
        data: {
          name: name.trim(),
          description: description.trim(),
          category: category || '家常菜',
          difficulty,
          estimatedMinutes: parseInt(estimatedMinutes) || 30,
          ingredients: validIngredients.map(i => ({
            name: i.name.trim(),
            amount: parseFloat(i.amount) || 0,
            unit: i.unit || '个',
          })),
          steps: validSteps.map((s, idx) => ({
            order: idx + 1,
            desc: s.desc.trim(),
            tips: s.tips.trim(),
          })),
          tutorials: tutorials.filter(t => t.url.trim()).map(t => ({
            platform: t.platform,
            title: t.title.trim(),
            url: t.url.trim(),
          })),
        },
      });
      if (result.result && result.result.error) {
        wx.hideLoading();
        wx.showToast({ title: result.result.error, icon: 'none' });
        return;
      }

      wx.hideLoading();
      wx.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '添加失败', icon: 'none' });
      console.error('Save recipe error:', err);
    }
  },

  onCancel() {
    wx.navigateBack();
  },
});
