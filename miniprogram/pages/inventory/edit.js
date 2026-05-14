const { getCurrentUser, getCollection, COLLECTIONS } = require('../../utils/db');

const QUICK_UNITS = ['个', '斤', '克', '袋', '盒', '瓶'];
const QUICK_LOCATIONS = ['冷藏', '冷冻', '常温'];
const QUICK_CATEGORIES = ['蔬菜', '肉类', '蛋奶', '调味品', '主食', '其他'];
const QUICK_EXPIRES = [
  { label: '今天', days: 0 },
  { label: '明天', days: 1 },
  { label: '3天后', days: 3 },
  { label: '7天后', days: 7 },
];

Page({
  data: {
    isEdit: false,
    itemId: '',
    name: '',
    category: '',
    quantity: '',
    unit: '',
    storageLocation: '',
    expireDate: '',
    quickUnits: QUICK_UNITS,
    quickLocations: QUICK_LOCATIONS,
    quickCategories: QUICK_CATEGORIES,
    quickExpires: QUICK_EXPIRES,
  },

  async onLoad(options) {
    this.user = await getCurrentUser();
    if (options.id) {
      this.setData({ isEdit: true, itemId: options.id });
      await this.loadItem(options.id);
    }
  },

  async loadItem(id) {
    const res = await getCollection(COLLECTIONS.INVENTORY).doc(id).get();
    const item = res.data;
    this.setData({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      storageLocation: item.storageLocation,
      expireDate: item.expireDate ? item.expireDate.substring(0, 10) : '',
    });
  },

  onInputName(e) { this.setData({ name: e.detail.value }); },
  onInputQuantity(e) { this.setData({ quantity: e.detail.value }); },
  onSelectUnit(e) { this.setData({ unit: e.currentTarget.dataset.value }); },
  onSelectLocation(e) { this.setData({ storageLocation: e.currentTarget.dataset.value }); },
  onSelectCategory(e) { this.setData({ category: e.currentTarget.dataset.value }); },

  onSelectQuickExpire(e) {
    const days = parseInt(e.currentTarget.dataset.days);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().substring(0, 10);
    this.setData({ expireDate: dateStr });
  },

  onDateChange(e) {
    this.setData({ expireDate: e.detail.value });
  },

  async onSave() {
    const { name, category, quantity, unit, storageLocation, expireDate, isEdit, itemId } = this.data;

    if (!name.trim()) {
      wx.showToast({ title: '请输入食材名称', icon: 'none' });
      return;
    }

    const data = {
      name: name.trim(),
      category: category || '其他',
      quantity: parseFloat(quantity) || 0,
      unit: unit || '个',
      storageLocation: storageLocation || '常温',
      expireDate: expireDate || '',
      status: 'normal',
      updatedAt: new Date(),
    };

    if (isEdit) {
      await getCollection(COLLECTIONS.INVENTORY).doc(itemId).update({ data });
    } else {
      data.familyId = this.user.familyId;
      data.createdBy = this.user._id;
      data.createdAt = new Date();
      await getCollection(COLLECTIONS.INVENTORY).add({ data });
    }

    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 500);
  },

  async onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个食材吗？',
      success: async (res) => {
        if (res.confirm) {
          await getCollection(COLLECTIONS.INVENTORY).doc(this.data.itemId).remove();
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 500);
        }
      },
    });
  },
});
