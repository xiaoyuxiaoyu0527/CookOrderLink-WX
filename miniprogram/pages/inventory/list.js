const { getCurrentUser, getFamilyInventory } = require('../../utils/db');
const { calculateInventoryStatus } = require('../../utils/inventory');

const CATEGORIES = ['全部', '蔬菜', '肉类', '蛋奶', '调味品', '主食', '其他'];

Page({
  data: {
    inventory: [],
    filteredInventory: [],
    categories: CATEGORIES,
    activeCategory: '全部',
    searchKeyword: '',
    expiringCount: 0,
  },

  async onLoad() {
    this.user = await getCurrentUser();
    await this.loadInventory();
  },

  async onShow() {
    await this.loadInventory();
  },

  async loadInventory() {
    if (!this.user.familyId) return;
    const inventory = await getFamilyInventory(this.user.familyId);

    const enriched = inventory.map(item => ({
      ...item,
      status: calculateInventoryStatus(item),
    }));

    const expiringCount = enriched.filter(i => i.status === 'expiring' || i.status === 'expired').length;

    this.setData({ inventory: enriched, expiringCount });
    this.applyFilter();
  },

  applyFilter() {
    let filtered = [...this.data.inventory];

    if (this.data.activeCategory !== '全部') {
      filtered = filtered.filter(i => i.category === this.data.activeCategory);
    }

    if (this.data.searchKeyword) {
      const kw = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(kw));
    }

    this.setData({ filteredInventory: filtered });
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category });
    this.applyFilter();
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
    this.applyFilter();
  },

  onAddInventory() {
    wx.navigateTo({ url: '/miniprogram/pages/inventory/edit' });
  },

  onEditInventory(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/miniprogram/pages/inventory/edit?id=${id}` });
  },
});
