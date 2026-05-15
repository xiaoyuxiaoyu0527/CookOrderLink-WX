# CookOrderLink 菜谱百科重设计 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CookOrderLink 从库存管理模式重构为菜谱百科模式，删除库存管理，添加菜谱百科（预置+手动），支持B站/小红书教程链接。

**Architecture:** 删除 inventory 相关代码，简化订单流程，新增菜谱详情页（含教程区域）和添加菜谱页。数据层使用 recipes 和 orders 两个集合。

**Tech Stack:** 微信小程序原生框架、微信云开发（云函数+云数据库）

---

## 文件结构

**删除的文件：**
- `miniprogram/pages/inventory/list.js`
- `miniprogram/pages/inventory/list.json`
- `miniprogram/pages/inventory/list.wxml`
- `miniprogram/pages/inventory/list.wxss`
- `miniprogram/pages/inventory/edit.js`
- `miniprogram/pages/inventory/edit.json`
- `miniprogram/pages/inventory/edit.wxml`
- `miniprogram/pages/inventory/edit.wxss`
- `miniprogram/utils/inventory.js`
- `cloudfunctions/updateInventoryStatus/` (整个目录)
- `cloudfunctions/checkExpiringInventory/` (整个目录)

**修改的文件：**
- `miniprogram/app.json` — 移除库存页面路由
- `miniprogram/utils/seed-recipes.js` — 更新预置数据（添加 tutorials 字段）
- `cloudfunctions/createOrder/index.js` — 简化（移除库存检查）
- `miniprogram/pages/order/order.js` — 移除库存检查逻辑
- `miniprogram/pages/order/order.wxml` — 更新 UI
- `miniprogram/pages/kitchen/kitchen.js` — 简化订单流程
- `miniprogram/pages/kitchen/kitchen.wxml` — 更新 UI
- `miniprogram/pages/recipe/detail.js` — 重写（添加教程区域）
- `miniprogram/pages/recipe/detail.wxml` — 重写
- `miniprogram/pages/recipe/detail.wxss` — 重写
- `miniprogram/pages/profile/profile.js` — 移除库存相关功能
- `miniprogram/pages/profile/profile.wxml` — 更新 UI

**新增的文件：**
- `miniprogram/pages/recipe/add.js`
- `miniprogram/pages/recipe/add.json`
- `miniprogram/pages/recipe/add.wxml`
- `miniprogram/pages/recipe/add.wxss`

---

## Task 1: 删除库存相关文件

**Files:**
- Delete: `miniprogram/pages/inventory/` (整个目录)
- Delete: `miniprogram/utils/inventory.js`
- Delete: `cloudfunctions/updateInventoryStatus/` (整个目录)
- Delete: `cloudfunctions/checkExpiringInventory/` (整个目录)

- [ ] **Step 1: 删除库存页面目录**

```bash
rm -rf miniprogram/pages/inventory
```

- [ ] **Step 2: 删除库存工具文件**

```bash
rm miniprogram/utils/inventory.js
```

- [ ] **Step 3: 删除库存相关云函数**

```bash
rm -rf cloudfunctions/updateInventoryStatus
rm -rf cloudfunctions/checkExpiringInventory
```

- [ ] **Step 4: 验证删除完成**

```bash
ls miniprogram/pages/inventory 2>&1 || echo "inventory pages deleted"
ls miniprogram/utils/inventory.js 2>&1 || echo "inventory.js deleted"
ls cloudfunctions/updateInventoryStatus 2>&1 || echo "updateInventoryStatus deleted"
ls cloudfunctions/checkExpiringInventory 2>&1 || echo "checkExpiringInventory deleted"
```

Expected: 所有提示 "deleted"

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove inventory management module"
```

---

## Task 2: 更新 app.json 路由

**Files:**
- Modify: `miniprogram/app.json`

- [ ] **Step 1: 更新 app.json**

移除库存页面路由，添加添加菜谱页面路由：

```json
{
  "pages": [
    "pages/order/order",
    "pages/kitchen/kitchen",
    "pages/recipe/detail",
    "pages/recipe/add",
    "pages/profile/profile"
  ],
  "window": {
    "navigationBarBackgroundColor": "#fdf8f3",
    "navigationBarTitleText": "CookOrderLink",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#fdf8f3"
  },
  "tabBar": {
    "color": "#8b7a6a",
    "selectedColor": "#e07a3a",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/order/order",
        "text": "点菜",
        "iconPath": "images/tab-order.png",
        "selectedIconPath": "images/tab-order-active.png"
      },
      {
        "pagePath": "pages/kitchen/kitchen",
        "text": "厨房",
        "iconPath": "images/tab-kitchen.png",
        "selectedIconPath": "images/tab-kitchen-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "images/tab-profile.png",
        "selectedIconPath": "images/tab-profile-active.png"
      }
    ]
  },
  "cloud": true
}
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/app.json
git commit -m "refactor: update app.json routes for recipe encyclopedia"
```

---

## Task 3: 更新预置菜谱数据

**Files:**
- Modify: `miniprogram/utils/seed-recipes.js`

- [ ] **Step 1: 重写 seed-recipes.js**

添加 tutorials 字段，移除 inventory 相关代码：

```javascript
const SEED_RECIPES = [
  {
    name: '番茄炒蛋',
    description: '经典家常快手菜，酸甜开胃',
    category: '家常菜',
    difficulty: 'easy',
    estimatedMinutes: 15,
    ingredients: [
      { name: '番茄', amount: 2, unit: '个' },
      { name: '鸡蛋', amount: 3, unit: '个' },
      { name: '葱', amount: 1, unit: '根' },
    ],
    steps: [
      { order: 1, desc: '番茄切块，鸡蛋打散加盐', tips: '番茄不要切太小' },
      { order: 2, desc: '热锅凉油，倒入蛋液炒至凝固', tips: '油温不要太高' },
      { order: 3, desc: '加入番茄翻炒出汁', tips: '' },
      { order: 4, desc: '加盐、糖调味，撒葱花出锅', tips: '加少量糖提升鲜味' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '番茄炒蛋的正确做法', url: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ],
  },
  {
    name: '红烧排骨',
    description: '色泽红亮，肉质酥烂',
    category: '荤菜',
    difficulty: 'medium',
    estimatedMinutes: 45,
    ingredients: [
      { name: '排骨', amount: 500, unit: '克' },
      { name: '姜', amount: 3, unit: '片' },
      { name: '蒜', amount: 3, unit: '瓣' },
      { name: '酱油', amount: 2, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '排骨焯水去血沫', tips: '冷水下锅' },
      { order: 2, desc: '热锅炒糖色，放入排骨翻炒', tips: '' },
      { order: 3, desc: '加酱油、料酒、姜蒜，加水没过排骨', tips: '' },
      { order: 4, desc: '大火烧开转小火炖30分钟', tips: '' },
      { order: 5, desc: '大火收汁即可', tips: '不要收太干' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '红烧排骨家常做法', url: 'https://www.bilibili.com/video/BV1EJ41127FS' },
    ],
  },
  {
    name: '清炒时蔬',
    description: '简单清爽的蔬菜小炒',
    category: '素菜',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '青菜', amount: 1, unit: '斤' },
      { name: '蒜', amount: 3, unit: '瓣' },
    ],
    steps: [
      { order: 1, desc: '青菜洗净切段，蒜切末', tips: '' },
      { order: 2, desc: '热锅爆香蒜末', tips: '' },
      { order: 3, desc: '下青菜大火翻炒至熟', tips: '大火快炒保持脆嫩' },
      { order: 4, desc: '加盐调味出锅', tips: '' },
    ],
    tutorials: [],
  },
  {
    name: '可乐鸡翅',
    description: '甜香入味，大人小孩都爱吃',
    category: '荤菜',
    difficulty: 'easy',
    estimatedMinutes: 30,
    ingredients: [
      { name: '鸡翅', amount: 8, unit: '个' },
      { name: '可乐', amount: 1, unit: '罐' },
      { name: '姜', amount: 3, unit: '片' },
      { name: '酱油', amount: 2, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '鸡翅划两刀，焯水去血沫', tips: '' },
      { order: 2, desc: '热锅煎鸡翅至两面金黄', tips: '' },
      { order: 3, desc: '倒入可乐，加酱油、姜片', tips: '可乐要没过鸡翅' },
      { order: 4, desc: '大火烧开转小火炖20分钟', tips: '' },
      { order: 5, desc: '大火收汁即可', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '可乐鸡翅简单做法', url: 'https://www.bilibili.com/video/BV1Ws41127p0' },
    ],
  },
  {
    name: '紫菜蛋花汤',
    description: '清淡营养的快手汤',
    category: '汤品',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '紫菜', amount: 1, unit: '张' },
      { name: '鸡蛋', amount: 2, unit: '个' },
    ],
    steps: [
      { order: 1, desc: '紫菜撕碎泡水，鸡蛋打散', tips: '' },
      { order: 2, desc: '水烧开后放入紫菜', tips: '' },
      { order: 3, desc: '淋入蛋液，加盐调味', tips: '蛋液要慢慢淋入' },
      { order: 4, desc: '滴几滴香油出锅', tips: '' },
    ],
    tutorials: [],
  },
  {
    name: '蒜蓉西兰花',
    description: '健康低脂，蒜香浓郁',
    category: '素菜',
    difficulty: 'easy',
    estimatedMinutes: 12,
    ingredients: [
      { name: '西兰花', amount: 1, unit: '颗' },
      { name: '蒜', amount: 5, unit: '瓣' },
    ],
    steps: [
      { order: 1, desc: '西兰花掰小朵焯水', tips: '焯水加点盐保持翠绿' },
      { order: 2, desc: '蒜切末备用', tips: '' },
      { order: 3, desc: '热锅爆香蒜末，放入西兰花翻炒', tips: '' },
      { order: 4, desc: '加盐调味出锅', tips: '' },
    ],
    tutorials: [],
  },
  {
    name: '蛋炒饭',
    description: '粒粒分明，简单美味',
    category: '主食',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '米饭', amount: 1, unit: '碗' },
      { name: '鸡蛋', amount: 2, unit: '个' },
      { name: '葱', amount: 1, unit: '根' },
    ],
    steps: [
      { order: 1, desc: '鸡蛋打散，葱切末', tips: '' },
      { order: 2, desc: '热锅凉油，倒入蛋液炒散', tips: '' },
      { order: 3, desc: '加入米饭大火翻炒', tips: '米饭要打散' },
      { order: 4, desc: '加盐调味，撒葱花出锅', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '蛋炒饭的秘诀', url: 'https://www.bilibili.com/video/BV1pJ411K7HZ' },
    ],
  },
  {
    name: '宫保鸡丁',
    description: '麻辣鲜香，经典川菜',
    category: '荤菜',
    difficulty: 'medium',
    estimatedMinutes: 25,
    ingredients: [
      { name: '鸡胸肉', amount: 300, unit: '克' },
      { name: '花生米', amount: 50, unit: '克' },
      { name: '干辣椒', amount: 5, unit: '个' },
      { name: '花椒', amount: 10, unit: '粒' },
    ],
    steps: [
      { order: 1, desc: '鸡胸肉切丁，加料酒、淀粉腌制', tips: '' },
      { order: 2, desc: '花生米炸熟备用', tips: '' },
      { order: 3, desc: '热锅爆香干辣椒和花椒', tips: '' },
      { order: 4, desc: '放入鸡丁翻炒至变色', tips: '' },
      { order: 5, desc: '加调料和花生米翻炒出锅', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '宫保鸡丁正宗做法', url: 'https://www.bilibili.com/video/BV1Ws41127p0' },
    ],
  },
  {
    name: '麻婆豆腐',
    description: '麻辣鲜香，下饭神器',
    category: '荤菜',
    difficulty: 'medium',
    estimatedMinutes: 20,
    ingredients: [
      { name: '豆腐', amount: 1, unit: '块' },
      { name: '猪肉末', amount: 100, unit: '克' },
      { name: '豆瓣酱', amount: 1, unit: '勺' },
      { name: '花椒粉', amount: 1, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '豆腐切块焯水', tips: '' },
      { order: 2, desc: '热锅炒肉末至变色', tips: '' },
      { order: 3, desc: '加豆瓣酱炒出红油', tips: '' },
      { order: 4, desc: '加入豆腐和水烧开', tips: '' },
      { order: 5, desc: '勾芡，撒花椒粉出锅', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '麻婆豆腐家常做法', url: 'https://www.bilibili.com/video/BV1EJ41127FS' },
    ],
  },
  {
    name: '酸辣土豆丝',
    description: '开胃下饭，简单快手',
    category: '素菜',
    difficulty: 'easy',
    estimatedMinutes: 15,
    ingredients: [
      { name: '土豆', amount: 2, unit: '个' },
      { name: '干辣椒', amount: 3, unit: '个' },
      { name: '醋', amount: 2, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '土豆去皮切丝，泡水去淀粉', tips: '切得越细越好' },
      { order: 2, desc: '热锅爆香干辣椒', tips: '' },
      { order: 3, desc: '放入土豆丝大火翻炒', tips: '' },
      { order: 4, desc: '加醋和盐调味出锅', tips: '醋要最后加' },
    ],
    tutorials: [
      { platform: 'xiaohongshu', title: '酸辣土豆丝小红书教程', url: 'https://www.xiaohongshu.com/explore/酸辣土豆丝' },
    ],
  },
];

async function seedRecipes(familyId, openid) {
  const db = wx.cloud.database();
  for (const recipe of SEED_RECIPES) {
    await db.collection('recipes').add({
      data: {
        ...recipe,
        familyId,
        coverUrl: '',
        createdBy: openid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

module.exports = { SEED_RECIPES, seedRecipes };
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/utils/seed-recipes.js
git commit -m "feat: update seed recipes with tutorials field"
```

---

## Task 4: 简化 createOrder 云函数

**Files:**
- Modify: `cloudfunctions/createOrder/index.js`

- [ ] **Step 1: 重写 createOrder/index.js**

移除库存检查逻辑，简化订单创建：

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { items } = event;

  if (!items || items.length === 0) return { error: '请至少选择一道菜' };

  try {
    const userRes = await db.collection('users').doc(openid).get();
    const user = userRes.data;
    if (!user.familyId) return { error: '请先加入家庭组' };

    // 验证菜品是否存在
    const recipeIds = items.map(i => i.recipeId);
    const recipesRes = await db.collection('recipes')
      .where({ _id: _.in(recipeIds) })
      .get();

    if (recipesRes.data.length !== recipeIds.length) {
      return { error: '部分菜品不存在' };
    }

    // 创建订单
    const orderRes = await db.collection('orders').add({
      data: {
        familyId: user.familyId,
        createdBy: openid,
        status: 'pending',
        items: items.map(i => ({
          recipeId: i.recipeId,
          name: i.name,
          note: i.note || '',
        })),
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    // 通知厨房端
    const familyRes = await db.collection('families').doc(user.familyId).get();
    const family = familyRes.data;
    const husbandId = family.members.find(m => m !== openid);
    if (husbandId) {
      const dishNames = items.map(i => i.name).join('、');
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: husbandId,
          templateId: 'zIoRVqR89IsQSbh2D27EtprZ8TUd-q_tDXY7gbD03r4',
          data: { thing1: { value: `新订单：${dishNames}` } },
          page: 'pages/kitchen/kitchen',
        });
      } catch (err) {
        console.error('Send order notification failed:', err);
      }
    }

    return { orderId: orderRes._id };
  } catch (err) {
    console.error('createOrder error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add cloudfunctions/createOrder/index.js
git commit -m "refactor: simplify createOrder by removing inventory checks"
```

---

## Task 5: 更新点菜页和 recipe-tile 组件

**Files:**
- Modify: `miniprogram/pages/order/order.js`
- Modify: `miniprogram/pages/order/order.wxml`
- Modify: `miniprogram/components/recipe-tile/recipe-tile.js`
- Modify: `miniprogram/components/recipe-tile/recipe-tile.wxml`
- Modify: `miniprogram/components/recipe-tile/recipe-tile.wxss`

- [ ] **Step 1: 更新 order.js**

移除库存检查逻辑，简化数据加载：

```javascript
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
```

- [ ] **Step 2: 更新 order.wxml**

```html
<view class="page">
  <view class="page-header">
    <view class="page-title">今天吃什么？</view>
    <view class="page-subtitle">选择想吃的菜品，提交给厨房</view>
  </view>

  <view wx:for="{{recipes}}" wx:key="_id">
    <recipe-tile
      recipe="{{item}}"
      selected="{{selectedIds.indexOf(item._id) >= 0}}"
      bind:toggle="onToggleRecipe"
      bind:notechange="onNoteChange" />
  </view>

  <view wx:if="{{recipes.length === 0}}" class="empty-state">
    <view class="empty-icon">🍽️</view>
    <text class="empty-text">暂无菜品，请先添加菜谱</text>
  </view>

  <view wx:if="{{totalCount > 0}}" class="bottom-bar">
    <view class="bar-info">
      <text class="bar-count">已选 {{totalCount}} 道菜</text>
      <text class="bar-time" wx:if="{{totalMinutes > 0}}">约 {{totalMinutes}} 分钟</text>
    </view>
    <button class="btn-primary" bindtap="onSubmitOrder">提交订单</button>
  </view>
</view>
```

- [ ] **Step 3: 更新 recipe-tile 组件**

移除 available 和 missingIngredients 相关逻辑：

`miniprogram/components/recipe-tile/recipe-tile.js`:
```javascript
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
```

`miniprogram/components/recipe-tile/recipe-tile.wxml`:
```html
<view class="tile {{selected ? 'tile-selected' : 'tile-default'}}" bindtap="onTap">
  <view class="tile-accent" wx:if="{{selected}}"></view>
  <view class="tile-content">
    <view class="tile-header">
      <view class="tile-title-group">
        <view class="recipe-name">{{recipe.name}}</view>
        <view class="recipe-desc">{{recipe.description}}</view>
      </view>
      <view class="tile-badge" wx:if="{{selected}}">
        <text class="badge-icon">✓</text>
      </view>
    </view>
    <view class="meta-row">
      <view class="meta-pill">
        <text class="meta-icon">⏱</text>
        <text class="meta-text">{{recipe.estimatedMinutes}}分钟</text>
      </view>
      <view class="meta-pill">
        <text class="meta-icon">📊</text>
        <text class="meta-text" wx:if="{{recipe.difficulty === 'easy'}}">简单</text>
        <text class="meta-text" wx:elif="{{recipe.difficulty === 'medium'}}">中等</text>
        <text class="meta-text" wx:else>困难</text>
      </view>
    </view>
    <view wx:if="{{selected}}" class="note-area" catchtap="">
      <input class="note-input" placeholder="添加备注，如：少放盐" value="{{recipe._note}}" bindinput="onNoteInput" />
    </view>
  </view>
</view>
```

`miniprogram/components/recipe-tile/recipe-tile.wxss`:
```css
.tile {
  position: relative;
  margin: 20rpx 32rpx;
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--color-canvas-card);
  box-shadow: var(--shadow-card);
}
.tile:active {
  transform: scale(0.98);
}
.tile-selected {
  box-shadow: 0 4rpx 24rpx rgba(224, 122, 58, 0.15);
  border: 2rpx solid var(--color-primary-light);
}
.tile-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
}
.tile-content { padding: 32rpx 36rpx; }
.tile-header { display: flex; justify-content: space-between; align-items: flex-start; }
.tile-title-group { flex: 1; margin-right: 20rpx; }
.recipe-name { font: var(--font-title); color: var(--color-ink); margin-bottom: 8rpx; }
.recipe-desc { font: var(--font-caption); color: var(--color-ink-muted); }
.tile-badge {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(224, 122, 58, 0.3);
}
.badge-icon { color: #ffffff; font-size: 28rpx; font-weight: bold; }
.meta-row { display: flex; gap: 16rpx; margin-top: 20rpx; }
.meta-pill {
  display: flex; align-items: center; gap: 6rpx;
  background: var(--color-canvas-warm); padding: 8rpx 20rpx; border-radius: var(--radius-pill);
}
.meta-icon { font-size: 22rpx; }
.meta-text { font: var(--font-tiny); color: var(--color-ink-soft); }
.note-area { margin-top: 20rpx; }
.note-input {
  background: var(--color-canvas-warm); border-radius: var(--radius-pill);
  padding: 16rpx 28rpx; font: var(--font-caption); color: var(--color-ink);
  border: 1rpx solid var(--color-hairline);
}
```

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/order/ miniprogram/components/recipe-tile/
git commit -m "refactor: update order page for recipe encyclopedia mode"
```

---

## Task 6: 重写菜谱详情页

**Files:**
- Modify: `miniprogram/pages/recipe/detail.js`
- Modify: `miniprogram/pages/recipe/detail.wxml`
- Modify: `miniprogram/pages/recipe/detail.wxss`
- Modify: `miniprogram/pages/recipe/detail.json`

- [ ] **Step 1: 更新 detail.json**

```json
{
  "navigationBarTitleText": "菜谱详情"
}
```

- [ ] **Step 2: 重写 detail.js**

```javascript
const { getCurrentUser, getCollection, COLLECTIONS } = require('../../utils/db');

Page({
  data: {
    recipe: null,
    orderId: '',
  },

  async onLoad(options) {
    try {
      this.user = await getCurrentUser();
      if (options.id) {
        await this.loadRecipe(options.id);
      }
      if (options.orderId) {
        this.setData({ orderId: options.orderId });
      }
    } catch (err) {
      console.error('onLoad error:', err);
    }
  },

  async loadRecipe(id) {
    const res = await getCollection(COLLECTIONS.RECIPES).doc(id).get();
    this.setData({ recipe: res.data });
  },

  onOpenTutorial(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({ title: '链接已复制，请在浏览器中打开', icon: 'none' });
        },
      });
    }
  },

  onBack() {
    wx.navigateBack();
  },
});
```

- [ ] **Step 3: 重写 detail.wxml**

```html
<view class="page" wx:if="{{recipe}}">
  <!-- Header -->
  <view class="recipe-header">
    <view class="recipe-category">{{recipe.category}}</view>
    <view class="recipe-name">{{recipe.name}}</view>
    <view class="recipe-desc">{{recipe.description}}</view>
    <view class="recipe-meta">
      <view class="meta-item">
        <text class="meta-icon">⏱</text>
        <text class="meta-text">{{recipe.estimatedMinutes}}分钟</text>
      </view>
      <view class="meta-item">
        <text class="meta-icon">📊</text>
        <text class="meta-text" wx:if="{{recipe.difficulty === 'easy'}}">简单</text>
        <text class="meta-text" wx:elif="{{recipe.difficulty === 'medium'}}">中等</text>
        <text class="meta-text" wx:else>困难</text>
      </view>
    </view>
  </view>

  <!-- Ingredients -->
  <view class="section">
    <view class="section-title">🛒 需要购买的材料</view>
    <view class="ingredients-list">
      <view wx:for="{{recipe.ingredients}}" wx:key="name" class="ingredient-item">
        <text class="ingredient-name">{{item.name}}</text>
        <text class="ingredient-amount">{{item.amount}}{{item.unit}}</text>
      </view>
    </view>
  </view>

  <!-- Steps -->
  <view class="section">
    <view class="section-title">👨‍🍳 制作步骤</view>
    <view class="steps-list">
      <view wx:for="{{recipe.steps}}" wx:key="order" class="step-item">
        <view class="step-number">{{item.order}}</view>
        <view class="step-content">
          <text class="step-desc">{{item.desc}}</text>
          <text wx:if="{{item.tips}}" class="step-tips">💡 {{item.tips}}</text>
        </view>
      </view>
    </view>
  </view>

  <!-- Tutorials -->
  <view class="section" wx:if="{{recipe.tutorials && recipe.tutorials.length > 0}}">
    <view class="section-title">🎬 视频教程</view>
    <view class="tutorials-list">
      <view wx:for="{{recipe.tutorials}}" wx:key="url" class="tutorial-item" bindtap="onOpenTutorial" data-url="{{item.url}}">
        <view class="tutorial-icon">
          <text wx:if="{{item.platform === 'bilibili'}}">🔴</text>
          <text wx:elif="{{item.platform === 'xiaohongshu'}}">📕</text>
          <text wx:else>📺</text>
        </view>
        <view class="tutorial-info">
          <text class="tutorial-platform" wx:if="{{item.platform === 'bilibili'}}">哔哩哔哩</text>
          <text class="tutorial-platform" wx:elif="{{item.platform === 'xiaohongshu'}}">小红书</text>
          <text class="tutorial-platform" wx:else>{{item.platform}}</text>
          <text class="tutorial-title">{{item.title}}</text>
        </view>
        <view class="tutorial-arrow">›</view>
      </view>
    </view>
  </view>

  <!-- Back Button -->
  <view class="bottom-action">
    <button class="btn-secondary" bindtap="onBack">返回</button>
  </view>
</view>
```

- [ ] **Step 4: 重写 detail.wxss**

```css
.page {
  background: var(--color-canvas);
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.recipe-header {
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #fff8f0 0%, #fdf8f3 100%);
}

.recipe-category {
  display: inline-block;
  background: var(--color-primary);
  color: #ffffff;
  font: var(--font-tiny);
  padding: 6rpx 16rpx;
  border-radius: var(--radius-pill);
  margin-bottom: 16rpx;
}

.recipe-name {
  font: var(--font-display);
  color: var(--color-ink);
  margin-bottom: 12rpx;
}

.recipe-desc {
  font: var(--font-body);
  color: var(--color-ink-muted);
  margin-bottom: 20rpx;
}

.recipe-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon {
  font-size: 24rpx;
}

.meta-text {
  font: var(--font-caption);
  color: var(--color-ink-soft);
}

.section {
  padding: 32rpx;
  border-bottom: 1rpx solid var(--color-hairline);
}

.section-title {
  font: var(--font-title);
  color: var(--color-ink);
  margin-bottom: 24rpx;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  background: var(--color-canvas-warm);
  border-radius: var(--radius-md);
}

.ingredient-name {
  font: var(--font-body);
  color: var(--color-ink);
}

.ingredient-amount {
  font: var(--font-body-medium);
  color: var(--color-primary);
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--color-primary);
  color: #ffffff;
  font: var(--font-body-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.step-desc {
  font: var(--font-body);
  color: var(--color-ink);
}

.step-tips {
  font: var(--font-caption);
  color: var(--color-ink-muted);
  padding: 12rpx 16rpx;
  background: #fff8f0;
  border-radius: var(--radius-sm);
}

.tutorials-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tutorial-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: var(--color-canvas-warm);
  border-radius: var(--radius-lg);
}

.tutorial-icon {
  font-size: 40rpx;
}

.tutorial-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.tutorial-platform {
  font: var(--font-tiny);
  color: var(--color-ink-muted);
}

.tutorial-title {
  font: var(--font-body-medium);
  color: var(--color-ink);
}

.tutorial-arrow {
  font-size: 36rpx;
  color: var(--color-ink-muted);
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--color-canvas-card);
  box-shadow: 0 -4rpx 20rpx rgba(61, 44, 30, 0.08);
}
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/recipe/detail.*
git commit -m "feat: rewrite recipe detail page with tutorials section"
```

---

## Task 7: 创建添加菜谱页面

**Files:**
- Create: `miniprogram/pages/recipe/add.js`
- Create: `miniprogram/pages/recipe/add.json`
- Create: `miniprogram/pages/recipe/add.wxml`
- Create: `miniprogram/pages/recipe/add.wxss`

- [ ] **Step 1: 创建 add.json**

```json
{
  "navigationBarTitleText": "添加菜谱"
}
```

- [ ] **Step 2: 创建 add.js**

```javascript
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
      await getCollection(COLLECTIONS.RECIPES).add({
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
          familyId: this.user.familyId,
          coverUrl: '',
          createdBy: this.user._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

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
```

- [ ] **Step 3: 创建 add.wxml**

```html
<view class="page">
  <!-- Basic Info -->
  <view class="section">
    <view class="section-title">基本信息</view>
    <view class="form-group">
      <view class="form-label">菜品名称 *</view>
      <input class="form-input" placeholder="如：番茄炒蛋" value="{{name}}" bindinput="onInputName" />
    </view>
    <view class="form-group">
      <view class="form-label">描述</view>
      <input class="form-input" placeholder="简单描述这道菜" value="{{description}}" bindinput="onInputDesc" />
    </view>
    <view class="form-group">
      <view class="form-label">分类</view>
      <picker range="{{categories}}" bindchange="onSelectCategory">
        <view class="form-picker">{{category || '选择分类'}}</view>
      </picker>
    </view>
    <view class="form-group">
      <view class="form-label">难度</view>
      <picker range="{{difficulties}}" range-key="label" bindchange="onSelectDifficulty">
        <view class="form-picker">{{difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}}</view>
      </picker>
    </view>
    <view class="form-group">
      <view class="form-label">预计时间（分钟）</view>
      <input class="form-input" type="number" placeholder="如：30" value="{{estimatedMinutes}}" bindinput="onInputMinutes" />
    </view>
  </view>

  <!-- Ingredients -->
  <view class="section">
    <view class="section-header">
      <view class="section-title">食材清单</view>
      <view class="add-btn" bindtap="onAddIngredient">+ 添加</view>
    </view>
    <view wx:for="{{ingredients}}" wx:key="index" class="ingredient-row">
      <input class="form-input ingredient-name" placeholder="食材名称" value="{{item.name}}" bindinput="onInputIngredientName" data-idx="{{index}}" />
      <input class="form-input ingredient-amount" type="digit" placeholder="用量" value="{{item.amount}}" bindinput="onInputIngredientAmount" data-idx="{{index}}" />
      <input class="form-input ingredient-unit" placeholder="单位" value="{{item.unit}}" bindinput="onInputIngredientUnit" data-idx="{{index}}" />
      <view class="remove-btn" bindtap="onRemoveIngredient" data-idx="{{index}}">×</view>
    </view>
  </view>

  <!-- Steps -->
  <view class="section">
    <view class="section-header">
      <view class="section-title">制作步骤</view>
      <view class="add-btn" bindtap="onAddStep">+ 添加</view>
    </view>
    <view wx:for="{{steps}}" wx:key="index" class="step-row">
      <view class="step-number">{{index + 1}}</view>
      <view class="step-inputs">
        <input class="form-input" placeholder="步骤描述" value="{{item.desc}}" bindinput="onInputStepDesc" data-idx="{{index}}" />
        <input class="form-input step-tips" placeholder="小贴士（可选）" value="{{item.tips}}" bindinput="onInputStepTips" data-idx="{{index}}" />
      </view>
      <view class="remove-btn" bindtap="onRemoveStep" data-idx="{{index}}">×</view>
    </view>
  </view>

  <!-- Tutorials -->
  <view class="section">
    <view class="section-header">
      <view class="section-title">视频教程</view>
      <view class="add-btn" bindtap="onAddTutorial">+ 添加</view>
    </view>
    <view wx:for="{{tutorials}}" wx:key="index" class="tutorial-row">
      <picker range="{{['哔哩哔哩', '小红书']}}" bindchange="onSelectTutorialPlatform" data-idx="{{index}}">
        <view class="form-picker tutorial-platform">{{item.platform === 'bilibili' ? '哔哩哔哩' : '小红书'}}</view>
      </picker>
      <input class="form-input" placeholder="教程标题" value="{{item.title}}" bindinput="onInputTutorialTitle" data-idx="{{index}}" />
      <input class="form-input" placeholder="视频链接" value="{{item.url}}" bindinput="onInputTutorialUrl" data-idx="{{index}}" />
      <view class="remove-btn" bindtap="onRemoveTutorial" data-idx="{{index}}">×</view>
    </view>
  </view>

  <!-- Actions -->
  <view class="actions">
    <button class="btn-secondary" bindtap="onCancel">取消</button>
    <button class="btn-primary" bindtap="onSave">保存菜谱</button>
  </view>
</view>
```

- [ ] **Step 4: 创建 add.wxss**

```css
.page {
  background: var(--color-canvas);
  min-height: 100vh;
  padding-bottom: 160rpx;
}

.section {
  padding: 32rpx;
  border-bottom: 1rpx solid var(--color-hairline);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font: var(--font-title);
  color: var(--color-ink);
  margin-bottom: 24rpx;
}

.section-header .section-title {
  margin-bottom: 0;
}

.add-btn {
  font: var(--font-caption-medium);
  color: var(--color-primary);
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  font: var(--font-caption-medium);
  color: var(--color-ink-muted);
  margin-bottom: 12rpx;
}

.form-input {
  background: var(--color-canvas-warm);
  border-radius: var(--radius-md);
  padding: 20rpx 24rpx;
  font: var(--font-body);
  color: var(--color-ink);
}

.form-picker {
  background: var(--color-canvas-warm);
  border-radius: var(--radius-md);
  padding: 20rpx 24rpx;
  font: var(--font-body);
  color: var(--color-ink);
}

.ingredient-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  align-items: center;
}

.ingredient-name {
  flex: 2;
}

.ingredient-amount {
  flex: 1;
}

.ingredient-unit {
  flex: 1;
}

.step-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
  align-items: flex-start;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--color-primary);
  color: #ffffff;
  font: var(--font-body-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 8rpx;
}

.step-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.step-tips {
  font: var(--font-caption);
}

.tutorial-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding: 20rpx;
  background: var(--color-canvas-warm);
  border-radius: var(--radius-md);
}

.tutorial-platform {
  background: var(--color-canvas-card);
}

.remove-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #ffebee;
  color: var(--color-danger);
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--color-canvas-card);
  box-shadow: 0 -4rpx 20rpx rgba(61, 44, 30, 0.08);
}

.actions button {
  flex: 1;
}
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/recipe/add.*
git commit -m "feat: add recipe creation page with tutorials support"
```

---

## Task 8: 更新厨房页

**Files:**
- Modify: `miniprogram/pages/kitchen/kitchen.js`
- Modify: `miniprogram/pages/kitchen/kitchen.wxml`

- [ ] **Step 1: 更新 kitchen.js**

移除库存相关逻辑，简化订单流程：

```javascript
const { getCurrentUser, getFamilyOrders } = require('../../utils/db');

const STATUS_TABS = [
  { key: 'pending', label: '待做' },
  { key: 'done', label: '已完成' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeTab: 'pending',
    orders: [],
    filteredOrders: [],
  },

  async onLoad() {
    try {
      this.user = await getCurrentUser();
      if (!this.user || !this.user.familyId) {
        wx.redirectTo({ url: '/pages/profile/profile' });
        return;
      }
    } catch (err) {
      console.error('onLoad error:', err);
      wx.redirectTo({ url: '/pages/profile/profile' });
    }
  },

  async onShow() {
    if (!this.user || !this.user.familyId) return;
    await this.loadOrders();
  },

  async loadOrders() {
    const orders = await getFamilyOrders(this.user.familyId);
    this.setData({ orders });
    this.updateFilteredOrders();
  },

  updateFilteredOrders() {
    const filteredOrders = this.data.orders.filter(o => o.status === this.data.activeTab);
    this.setData({ filteredOrders });
  },

  onTabTap(e) {
    const activeTab = e.currentTarget.dataset.tab;
    const filteredOrders = this.data.orders.filter(o => o.status === activeTab);
    this.setData({ activeTab, filteredOrders });
  },

  onOrderTap(e) {
    const { orderId } = e.detail;
    const order = this.data.orders.find(o => o._id === orderId);
    if (!order) return;

    const firstRecipeId = order.items[0]?.recipeId;
    if (firstRecipeId) {
      wx.navigateTo({
        url: `/pages/recipe/detail?id=${firstRecipeId}&orderId=${orderId}`,
      });
    }
  },

  async onCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '完成订单',
      content: '确认已完成所有菜品？',
      success: async (res) => {
        if (res.confirm) {
          await wx.cloud.callFunction({
            name: 'updateOrderStatus',
            data: { orderId, status: 'done' },
          });
          wx.showToast({ title: '已完成', icon: 'success' });
          await this.loadOrders();
        }
      },
    });
  },
});
```

- [ ] **Step 2: 更新 kitchen.wxml**

```html
<view class="page">
  <view class="tabs">
    <view wx:for="{{statusTabs}}" wx:key="key"
          class="tab {{activeTab === item.key ? 'active' : ''}}"
          data-tab="{{item.key}}" bindtap="onTabTap">
      {{item.label}}
    </view>
  </view>

  <view class="order-list">
    <block wx:for="{{filteredOrders}}" wx:key="_id">
      <order-card order="{{item}}" bind:tap="onOrderTap" />
      <view wx:if="{{item.status === 'pending'}}" class="order-action">
        <button class="btn-ghost" bindtap="onCompleteOrder" data-id="{{item._id}}">标记完成</button>
      </view>
    </block>

    <view wx:if="{{filteredOrders.length === 0}}" class="empty-state">
      <view class="empty-icon">📋</view>
      <text class="empty-text">暂无订单</text>
    </view>
  </view>
</view>
```

- [ ] **Step 3: 更新 kitchen.wxss**

添加 order-action 样式：

```css
.order-action {
  padding: 0 32rpx 16rpx;
  display: flex;
  justify-content: flex-end;
}
```

- [ ] **Step 4: Commit**

```bash
git add miniprogram/pages/kitchen/
git commit -m "refactor: simplify kitchen page for recipe encyclopedia mode"
```

---

## Task 9: 更新个人中心页

**Files:**
- Modify: `miniprogram/pages/profile/profile.js`
- Modify: `miniprogram/pages/profile/profile.wxml`

- [ ] **Step 1: 更新 profile.js**

在 `onSeedRecipes` 方法后添加：

```javascript
  onAddRecipe() {
    wx.navigateTo({ url: '/pages/recipe/add' });
  },
```

移除 `onSeedInventory` 方法（如果存在）。

- [ ] **Step 2: 更新 profile.wxml**

在「添加示例菜谱」按钮后添加：

```html
    <button class="btn-secondary" bindtap="onAddRecipe">添加新菜谱</button>
```

移除「添加示例库存」按钮（如果存在）。

- [ ] **Step 3: Commit**

```bash
git add miniprogram/pages/profile/
git commit -m "refactor: update profile page for recipe encyclopedia mode"
```

---

## Task 10: 测试完整流程

- [ ] **Step 1: 测试点菜流程**

1. 打开小程序，进入点菜页
2. 验证菜谱列表正常显示
3. 选择一个菜品，验证选中状态
4. 添加备注
5. 提交订单
6. 验证提交成功提示

- [ ] **Step 2: 测试厨房流程**

1. 切换到厨房页
2. 验证订单列表显示
3. 点击订单，验证进入菜谱详情
4. 验证食材清单显示
5. 验证制作步骤显示
6. 验证教程链接显示
7. 点击教程链接，验证复制成功
8. 返回厨房页，标记订单完成

- [ ] **Step 3: 测试添加菜谱**

1. 进入我的页面
2. 点击「添加新菜谱」
3. 填写基本信息
4. 添加食材
5. 添加步骤
6. 添加教程链接
7. 保存菜谱
8. 验证点菜页出现新菜谱

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: verify recipe encyclopedia complete flow"
```

---

## 自检清单

- [ ] 删除所有 inventory 相关代码
- [ ] 更新 app.json 路由
- [ ] 预置菜谱包含 tutorials 字段
- [ ] createOrder 云函数简化（无库存检查）
- [ ] 点菜页移除库存检查
- [ ] 菜谱详情页显示教程区域
- [ ] 添加菜谱页面完整可用
- [ ] 厨房页简化订单流程
- [ ] 所有页面使用暖色调设计
- [ ] 完整流程可正常运行
