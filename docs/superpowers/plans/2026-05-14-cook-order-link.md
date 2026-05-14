# CookOrderLink Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Mini Program for family cooking collaboration -- wife orders dishes, husband cooks, inventory auto-deducts, expiry reminders notify.

**Architecture:** Native WeChat Mini Program with cloud development. TabBar with two tabs (Order / Kitchen). Cloud functions handle auth, order creation, status transitions, inventory deduction, and daily expiry checks. All data isolated by familyId.

**Tech Stack:** WeChat Mini Program (WXML/WXSS/JS), WeChat Cloud Development (cloud functions + cloud database + cloud storage)

**Design Spec:** `docs/superpowers/specs/2026-05-14-cook-order-link-design.md`

---

## File Structure

```
cook-order-link/
+-- app.js                          # App entry, cloud init, login
+-- app.json                        # App config, pages, tabBar
+-- app.wxss                        # Global Apple Design System styles
+-- project.config.json             # Project config
+-- cloudfunctions/
|   +-- userLogin/
|   |   +-- index.js
|   |   +-- package.json
|   +-- createFamily/
|   |   +-- index.js
|   |   +-- package.json
|   +-- joinFamily/
|   |   +-- index.js
|   |   +-- package.json
|   +-- createOrder/
|   |   +-- index.js
|   |   +-- package.json
|   +-- updateOrderStatus/
|   |   +-- index.js
|   |   +-- package.json
|   +-- updateInventoryStatus/
|   |   +-- index.js
|   |   +-- package.json
|   +-- checkExpiringInventory/
|       +-- index.js
|       +-- package.json
+-- miniprogram/
    +-- pages/
    |   +-- order/
    |   |   +-- order.js
    |   |   +-- order.json
    |   |   +-- order.wxml
    |   |   +-- order.wxss
    |   +-- kitchen/
    |   |   +-- kitchen.js
    |   |   +-- kitchen.json
    |   |   +-- kitchen.wxml
    |   |   +-- kitchen.wxss
    |   +-- recipe/
    |   |   +-- detail.js
    |   |   +-- detail.json
    |   |   +-- detail.wxml
    |   |   +-- detail.wxss
    |   +-- inventory/
    |   |   +-- list.js
    |   |   +-- list.json
    |   |   +-- list.wxml
    |   |   +-- list.wxss
    |   |   +-- edit.js
    |   |   +-- edit.json
    |   |   +-- edit.wxml
    |   |   +-- edit.wxss
    |   +-- profile/
    |       +-- profile.js
    |       +-- profile.json
    |       +-- profile.wxml
    |       +-- profile.wxss
    +-- components/
    |   +-- recipe-tile/
    |   |   +-- recipe-tile.js
    |   |   +-- recipe-tile.json
    |   |   +-- recipe-tile.wxml
    |   |   +-- recipe-tile.wxss
    |   +-- order-card/
    |   |   +-- order-card.js
    |   |   +-- order-card.json
    |   |   +-- order-card.wxml
    |   |   +-- order-card.wxss
    |   +-- status-tag/
    |   |   +-- status-tag.js
    |   |   +-- status-tag.json
    |   |   +-- status-tag.wxml
    |   |   +-- status-tag.wxss
    +-- utils/
    |   +-- db.js                   # Database helpers
    |   +-- inventory.js            # Inventory status calculation
    |   +-- seed-recipes.js         # Seed recipe data
    +-- styles/
        +-- tokens.wxss             # Apple Design System tokens
```

---

## Phase 1: Foundation (基础框架)

### Task 1: Project Scaffolding

**Files:**
- Create: `app.js`, `app.json`, `app.wxss`, `project.config.json`

- [ ] **Step 1: Create app.json with tabBar config**

```json
{
  "pages": [
    "miniprogram/pages/order/order",
    "miniprogram/pages/kitchen/kitchen",
    "miniprogram/pages/recipe/detail",
    "miniprogram/pages/inventory/list",
    "miniprogram/pages/inventory/edit",
    "miniprogram/pages/profile/profile"
  ],
  "window": {
    "navigationBarBackgroundColor": "#000000",
    "navigationBarTitleText": "CookOrderLink",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#ffffff"
  },
  "tabBar": {
    "color": "#7a7a7a",
    "selectedColor": "#0066cc",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "miniprogram/pages/order/order",
        "text": "点菜",
        "iconPath": "miniprogram/images/tab-order.png",
        "selectedIconPath": "miniprogram/images/tab-order-active.png"
      },
      {
        "pagePath": "miniprogram/pages/kitchen/kitchen",
        "text": "厨房",
        "iconPath": "miniprogram/images/tab-kitchen.png",
        "selectedIconPath": "miniprogram/images/tab-kitchen-active.png"
      }
    ]
  },
  "cloud": true,
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/"
}
```

- [ ] **Step 2: Create app.js with cloud init and login**

```javascript
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cook-order-link-prod', // replace with your env id
      traceUser: true,
    });
    this.login();
  },

  async login() {
    try {
      const res = await wx.cloud.callFunction({ name: 'userLogin' });
      this.globalData.userInfo = res.result.userInfo;
      this.globalData.familyId = res.result.userInfo.familyId;
    } catch (err) {
      console.error('登录失败', err);
    }
  },

  globalData: {
    userInfo: null,
    familyId: null,
  },
});
```

- [ ] **Step 3: Create app.wxss with Apple Design System tokens**

```css
/* Apple Design System Tokens */
page {
  --color-primary: #0066cc;
  --color-primary-focus: #0071e3;
  --color-ink: #1d1d1f;
  --color-canvas: #ffffff;
  --color-canvas-parchment: #f5f5f7;
  --color-surface-tile-dark: #272729;
  --color-on-dark: #ffffff;
  --color-ink-muted-48: #7a7a7a;
  --color-hairline: #e0e0e0;
  --color-danger: #ff3b30;
  --color-warning: #ff9500;
  --color-success: #34c759;

  --font-display-lg: 600 80rpx/1.10 system-ui, -apple-system, sans-serif;
  --font-tagline: 600 42rpx/1.19 system-ui, -apple-system, sans-serif;
  --font-body: 400 34rpx/1.47 system-ui, -apple-system, sans-serif;
  --font-body-strong: 600 34rpx/1.24 system-ui, -apple-system, sans-serif;
  --font-caption: 400 28rpx/1.43 system-ui, -apple-system, sans-serif;

  --radius-none: 0;
  --radius-sm: 16rpx;
  --radius-lg: 36rpx;
  --radius-pill: 9999rpx;

  font: var(--font-body);
  color: var(--color-ink);
  background: var(--color-canvas);
}

.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
  font: var(--font-body);
  border-radius: var(--radius-pill);
  padding: 22rpx 44rpx;
  text-align: center;
  border: none;
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  font: var(--font-body);
  border-radius: var(--radius-pill);
  padding: 22rpx 44rpx;
  text-align: center;
  border: 2rpx solid var(--color-primary);
}

.card {
  background: var(--color-canvas);
  border: 1rpx solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: 48rpx;
}

.tile-light {
  background: var(--color-canvas);
  padding: 80rpx 48rpx;
}

.tile-dark {
  background: var(--color-surface-tile-dark);
  color: var(--color-on-dark);
  padding: 80rpx 48rpx;
}

.status-normal { color: var(--color-ink); }
.status-expiring { color: var(--color-warning); }
.status-expired { color: var(--color-danger); }
.status-out-of-stock { color: var(--color-ink-muted-48); }
```

- [ ] **Step 4: Create placeholder pages (empty stubs)**

Create each page directory with minimal files. For example, `miniprogram/pages/order/order.js`:

```javascript
Page({
  data: {},
  onLoad() {},
});
```

`miniprogram/pages/order/order.json`:

```json
{
  "navigationBarTitleText": "点菜"
}
```

`miniprogram/pages/order/order.wxml`:

```xml
<view class="page">
  <text>点菜页</text>
</view>
```

`miniprogram/pages/order/order.wxss`:

```css
.page { padding: 48rpx; }
```

Repeat for: kitchen, recipe/detail, inventory/list, inventory/edit, profile.

- [ ] **Step 5: Verify in WeChat DevTools**

Open project in WeChat DevTools. Confirm:
- App loads without errors
- Two tabs visible at bottom (点菜 / 厨房)
- Tab switching works
- All pages render their placeholder text

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: project scaffolding with tabBar and Apple Design System tokens"
```

---

### Task 2: Database Helpers

**Files:**
- Create: `miniprogram/utils/db.js`, `miniprogram/utils/inventory.js`

- [ ] **Step 1: Create db.js with common database operations**

```javascript
const db = wx.cloud.database();
const _ = db.command;

const COLLECTIONS = {
  USERS: 'users',
  FAMILIES: 'families',
  RECIPES: 'recipes',
  ORDERS: 'orders',
  INVENTORY: 'inventory',
};

function getCollection(name) {
  return db.collection(name);
}

async function getCurrentUser() {
  const app = getApp();
  if (app.globalData.userInfo) return app.globalData.userInfo;

  const res = await wx.cloud.callFunction({ name: 'userLogin' });
  app.globalData.userInfo = res.result.userInfo;
  app.globalData.familyId = res.result.userInfo.familyId;
  return res.result.userInfo;
}

async function getFamilyRecipes(familyId) {
  const res = await getCollection(COLLECTIONS.RECIPES)
    .where({ familyId })
    .orderBy('createdAt', 'desc')
    .get();
  return res.data;
}

async function getFamilyInventory(familyId) {
  const res = await getCollection(COLLECTIONS.INVENTORY)
    .where({ familyId })
    .orderBy('createdAt', 'desc')
    .get();
  return res.data;
}

async function getFamilyOrders(familyId, status) {
  const where = { familyId };
  if (status) where.status = status;
  const res = await getCollection(COLLECTIONS.ORDERS)
    .where(where)
    .orderBy('createdAt', 'desc')
    .get();
  return res.data;
}

module.exports = {
  db,
  _,
  COLLECTIONS,
  getCollection,
  getCurrentUser,
  getFamilyRecipes,
  getFamilyInventory,
  getFamilyOrders,
};
```

- [ ] **Step 2: Create inventory.js with status calculation**

```javascript
function calculateInventoryStatus(item) {
  if (item.quantity <= 0) return 'out_of_stock';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (!item.expireDate) return 'normal';

  const expireDate = new Date(item.expireDate);
  expireDate.setHours(0, 0, 0, 0);

  if (expireDate < now) return 'expired';

  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  if (expireDate <= threeDaysLater) return 'expiring';

  return 'normal';
}

function checkRecipeAvailability(recipe, inventory) {
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return { available: true, missing: [] };
  }

  const missing = [];
  for (const ingredient of recipe.ingredients) {
    const invItem = inventory.find(i => i._id === ingredient.inventoryItemId);
    if (!invItem) {
      missing.push({ name: ingredient.name, required: ingredient.amount, available: 0 });
      continue;
    }
    const status = calculateInventoryStatus(invItem);
    if (status === 'expired' || status === 'out_of_stock') {
      missing.push({ name: ingredient.name, required: ingredient.amount, available: invItem.quantity });
      continue;
    }
    if (invItem.quantity < ingredient.amount) {
      missing.push({ name: ingredient.name, required: ingredient.amount, available: invItem.quantity });
    }
  }

  return { available: missing.length === 0, missing };
}

module.exports = {
  calculateInventoryStatus,
  checkRecipeAvailability,
};
```

- [ ] **Step 3: Commit**

```bash
git add miniprogram/utils/
git commit -m "feat: database helpers and inventory status calculation"
```

---

### Task 3: userLogin Cloud Function

**Files:**
- Create: `cloudfunctions/userLogin/index.js`, `cloudfunctions/userLogin/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "userLogin",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const userRes = await db.collection('users').where({ _id: openid }).get();

    if (userRes.data.length > 0) {
      return { userInfo: userRes.data[0] };
    }

    const newUser = {
      _id: openid,
      nickName: '',
      avatarUrl: '',
      role: '',
      familyId: '',
      subscribeExpireReminder: false,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    await db.collection('users').add({ data: newUser });
    return { userInfo: newUser };
  } catch (err) {
    console.error('userLogin error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Deploy and test in WeChat DevTools**

Right-click `cloudfunctions/userLogin` -> "上传并部署：云端安装依赖". Then test in cloud function panel with empty input. Expected: returns `{ userInfo: { _id: "openid...", ... } }`.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/userLogin/
git commit -m "feat: userLogin cloud function"
```

---

### Task 4: createFamily Cloud Function

**Files:**
- Create: `cloudfunctions/createFamily/index.js`, `cloudfunctions/createFamily/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "createFamily",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const userRes = await db.collection('users').where({ _id: openid }).get();
    if (userRes.data.length === 0) return { error: '用户不存在' };
    if (userRes.data[0].familyId) return { error: '已加入家庭组' };

    const inviteCode = generateInviteCode();
    const familyRes = await db.collection('families').add({
      data: {
        inviteCode,
        members: [openid],
        createdBy: openid,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    const familyId = familyRes._id;

    await db.collection('users').doc(openid).update({
      data: {
        familyId,
        role: 'husband',
        updatedAt: db.serverDate(),
      },
    });

    return { familyId, inviteCode };
  } catch (err) {
    console.error('createFamily error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Deploy and test**

Deploy to cloud. Test with empty input. Expected: returns `{ familyId: "...", inviteCode: "ABC123" }`.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/createFamily/
git commit -m "feat: createFamily cloud function with invite code generation"
```

---

### Task 5: joinFamily Cloud Function

**Files:**
- Create: `cloudfunctions/joinFamily/index.js`, `cloudfunctions/joinFamily/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "joinFamily",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { inviteCode } = event;

  if (!inviteCode) return { error: '请输入邀请码' };

  try {
    const userRes = await db.collection('users').where({ _id: openid }).get();
    if (userRes.data.length === 0) return { error: '用户不存在' };
    if (userRes.data[0].familyId) return { error: '已加入家庭组' };

    const familyRes = await db.collection('families')
      .where({ inviteCode: inviteCode.toUpperCase() })
      .get();

    if (familyRes.data.length === 0) return { error: '邀请码无效' };

    const family = familyRes.data[0];

    if (family.members.length >= 2) return { error: '家庭组已满' };

    await db.collection('families').doc(family._id).update({
      data: {
        members: _.push(openid),
        updatedAt: db.serverDate(),
      },
    });

    await db.collection('users').doc(openid).update({
      data: {
        familyId: family._id,
        role: 'wife',
        updatedAt: db.serverDate(),
      },
    });

    return { familyId: family._id };
  } catch (err) {
    console.error('joinFamily error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Deploy and test**

Deploy. Test with `{ "inviteCode": "ABC123" }` using a second test account. Expected: returns `{ familyId: "..." }`.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/joinFamily/
git commit -m "feat: joinFamily cloud function"
```

---

### Task 6: Profile Page (Family Setup)

**Files:**
- Modify: `miniprogram/pages/profile/profile.js`, `profile.wxml`, `profile.wxss`, `profile.json`

- [ ] **Step 1: Write profile.json**

```json
{
  "navigationBarTitleText": "个人中心"
}
```

- [ ] **Step 2: Write profile.js**

```javascript
const { getCurrentUser, getCollection, COLLECTIONS } = require('../../utils/db');

Page({
  data: {
    userInfo: null,
    familyId: '',
    inviteCode: '',
    hasFamily: false,
    showJoinModal: false,
    joinCodeInput: '',
  },

  async onLoad() {
    const userInfo = await getCurrentUser();
    this.setData({ userInfo, hasFamily: !!userInfo.familyId, familyId: userInfo.familyId });

    if (userInfo.familyId) {
      const familyRes = await getCollection(COLLECTIONS.FAMILIES).doc(userInfo.familyId).get();
      this.setData({ inviteCode: familyRes.data.inviteCode });
    }
  },

  async onCreateFamily() {
    const res = await wx.cloud.callFunction({ name: 'createFamily' });
    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }
    this.setData({
      familyId: res.result.familyId,
      inviteCode: res.result.inviteCode,
      hasFamily: true,
    });
    getApp().globalData.familyId = res.result.familyId;
    wx.showToast({ title: '创建成功', icon: 'success' });
  },

  onShowJoinModal() {
    this.setData({ showJoinModal: true });
  },

  onJoinCodeInput(e) {
    this.setData({ joinCodeInput: e.detail.value });
  },

  async onJoinFamily() {
    const code = this.data.joinCodeInput.trim();
    if (!code) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    const res = await wx.cloud.callFunction({ name: 'joinFamily', data: { inviteCode: code } });
    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }
    this.setData({
      familyId: res.result.familyId,
      hasFamily: true,
      showJoinModal: false,
    });
    getApp().globalData.familyId = res.result.familyId;
    wx.showToast({ title: '加入成功', icon: 'success' });
  },

  onCloseModal() {
    this.setData({ showJoinModal: false });
  },

  onCopyInviteCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
    });
  },

  async onSeedRecipes() {
    if (!this.data.hasFamily) {
      wx.showToast({ title: '请先创建家庭组', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '添加菜谱...' });
    const { seedRecipes } = require('../../utils/seed-recipes');
    await seedRecipes(this.data.familyId, this.data.userInfo._id);
    wx.hideLoading();
    wx.showToast({ title: '已添加菜谱', icon: 'success' });
  },
});
```

- [ ] **Step 3: Write profile.wxml**

```xml
<view class="page">
  <!-- No Family State -->
  <view wx:if="{{!hasFamily}}" class="setup-container">
    <view class="setup-title">开始使用</view>
    <view class="setup-subtitle">创建家庭组或输入邀请码加入</view>

    <button class="btn-primary" bindtap="onCreateFamily">创建家庭组</button>
    <view class="divider-text">或</view>
    <button class="btn-secondary" bindtap="onShowJoinModal">输入邀请码加入</button>
  </view>

  <!-- Has Family State -->
  <view wx:else class="profile-container">
    <view class="card">
      <view class="card-label">家庭邀请码</view>
      <view class="invite-code">{{inviteCode}}</view>
      <button class="btn-secondary" bindtap="onCopyInviteCode">复制邀请码</button>
    </view>

    <view class="card">
      <view class="card-label">我的角色</view>
      <view class="role-text">{{userInfo.role === 'husband' ? '烹饪者' : '点菜者'}}</view>
    </view>

    <button class="btn-secondary" bindtap="onSeedRecipes">添加示例菜谱</button>
  </view>

  <!-- Join Modal -->
  <view wx:if="{{showJoinModal}}" class="modal-mask" bindtap="onCloseModal">
    <view class="modal-content" catchtap="">
      <view class="modal-title">加入家庭组</view>
      <input class="modal-input" placeholder="请输入6位邀请码" bindinput="onJoinCodeInput" maxlength="6" />
      <button class="btn-primary" bindtap="onJoinFamily">加入</button>
    </view>
  </view>
</view>
```

- [ ] **Step 4: Write profile.wxss**

```css
.page { padding: 48rpx; background: var(--color-canvas-parchment); min-height: 100vh; }

.setup-container { text-align: center; padding-top: 200rpx; }
.setup-title { font: var(--font-display-lg); margin-bottom: 16rpx; }
.setup-subtitle { font: var(--font-caption); color: var(--color-ink-muted-48); margin-bottom: 80rpx; }
.divider-text { color: var(--color-ink-muted-48); font: var(--font-caption); margin: 32rpx 0; }

.profile-container { display: flex; flex-direction: column; gap: 24rpx; }
.card { background: var(--color-canvas); border-radius: var(--radius-lg); padding: 48rpx; }
.card-label { font: var(--font-caption); color: var(--color-ink-muted-48); margin-bottom: 16rpx; }
.invite-code { font: var(--font-display-lg); letter-spacing: 8rpx; margin-bottom: 32rpx; }
.role-text { font: var(--font-body-strong); }

.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { background: var(--color-canvas); border-radius: var(--radius-lg); padding: 48rpx; width: 80%; }
.modal-title { font: var(--font-tagline); margin-bottom: 32rpx; text-align: center; }
.modal-input { border: 1rpx solid var(--color-hairline); border-radius: var(--radius-pill); padding: 22rpx 32rpx; margin-bottom: 32rpx; text-align: center; font-size: 36rpx; letter-spacing: 8rpx; }
```

- [ ] **Step 5: Verify in DevTools**

- Load profile page without family -> shows "创建家庭组" and "输入邀请码加入"
- Click 创建家庭组 -> shows invite code
- On second account, click "输入邀请码加入" -> enter code -> joins successfully
- After joining, profile shows role and invite code
- Click "添加示例菜谱" -> recipes appear in order page

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/profile/
git commit -m "feat: profile page with family create/join flow and seed recipes"
```

---

## Phase 2: Inventory Module (库存模块)

### Task 7: Inventory List Page

**Files:**
- Modify: `miniprogram/pages/inventory/list.js`, `list.wxml`, `list.wxss`, `list.json`

- [ ] **Step 1: Write list.json**

```json
{
  "navigationBarTitleText": "库存管理"
}
```

- [ ] **Step 2: Write list.js**

```javascript
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
```

- [ ] **Step 3: Write list.wxml**

```xml
<view class="page">
  <view class="search-bar">
    <input class="search-input" placeholder="搜索食材" bindinput="onSearchInput" value="{{searchKeyword}}" />
  </view>

  <view wx:if="{{expiringCount > 0}}" class="alert-bar">
    <text class="alert-text">有 {{expiringCount}} 件食材即将过期或已过期</text>
  </view>

  <scroll-view class="category-scroll" scroll-x>
    <view wx:for="{{categories}}" wx:key="*this"
          class="category-chip {{activeCategory === item ? 'active' : ''}}"
          data-category="{{item}}"
          bindtap="onCategoryTap">
      {{item}}
    </view>
  </scroll-view>

  <view class="inventory-list">
    <view wx:for="{{filteredInventory}}" wx:key="_id"
          class="inventory-card"
          data-id="{{item._id}}"
          bindtap="onEditInventory">
      <view class="card-header">
        <text class="item-name">{{item.name}}</text>
        <view class="status-tag status-{{item.status}}">
          <text wx:if="{{item.status === 'expiring'}}">即将过期</text>
          <text wx:elif="{{item.status === 'expired'}}">已过期</text>
          <text wx:elif="{{item.status === 'out_of_stock'}}">已用完</text>
          <text wx:else>{{item.quantity}}{{item.unit}}</text>
        </view>
      </view>
      <view class="card-meta">
        <text>{{item.category}}</text>
        <text>{{item.storageLocation}}</text>
        <text wx:if="{{item.expireDate}}">到期: {{item.expireDate}}</text>
      </view>
    </view>

    <view wx:if="{{filteredInventory.length === 0}}" class="empty-state">
      <text>暂无食材</text>
    </view>
  </view>

  <view class="fab" bindtap="onAddInventory">
    <text class="fab-icon">+</text>
  </view>
</view>
```

- [ ] **Step 4: Write list.wxss**

```css
.page { background: var(--color-canvas-parchment); min-height: 100vh; padding-bottom: 120rpx; }

.search-bar { padding: 24rpx 48rpx; background: var(--color-canvas); }
.search-input { background: var(--color-canvas); border: 1rpx solid var(--color-hairline); border-radius: var(--radius-pill); padding: 18rpx 32rpx; font: var(--font-body); }

.alert-bar { background: #fff3e0; padding: 20rpx 48rpx; }
.alert-text { color: var(--color-warning); font: var(--font-caption); }

.category-scroll { white-space: nowrap; padding: 24rpx 48rpx; background: var(--color-canvas); }
.category-chip { display: inline-block; padding: 12rpx 28rpx; border-radius: var(--radius-pill); font: var(--font-caption); margin-right: 16rpx; background: var(--color-canvas-parchment); color: var(--color-ink-muted-48); }
.category-chip.active { background: var(--color-primary); color: #ffffff; }

.inventory-list { padding: 24rpx 48rpx; }
.inventory-card { background: var(--color-canvas); border-radius: var(--radius-lg); padding: 32rpx; margin-bottom: 16rpx; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.item-name { font: var(--font-body-strong); }
.card-meta { font: var(--font-caption); color: var(--color-ink-muted-48); display: flex; gap: 24rpx; }

.status-tag { font: var(--font-caption); padding: 4rpx 16rpx; border-radius: var(--radius-pill); }
.status-normal { color: var(--color-success); background: #e8f5e9; }
.status-expiring { color: var(--color-warning); background: #fff3e0; }
.status-expired { color: var(--color-danger); background: #ffebee; }
.status-out_of_stock { color: var(--color-ink-muted-48); background: #f5f5f5; }

.empty-state { text-align: center; padding: 120rpx 0; color: var(--color-ink-muted-48); font: var(--font-caption); }

.fab { position: fixed; bottom: 48rpx; right: 48rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background: var(--color-primary); display: flex; align-items: center; justify-content: center; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15); }
.fab-icon { color: #ffffff; font-size: 48rpx; }
```

- [ ] **Step 5: Verify**

- Navigate to inventory list -> shows empty state
- Category chips visible and tappable
- Search input works
- FAB button navigates to edit page

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/inventory/list.*
git commit -m "feat: inventory list page with search, filter, and status tags"
```

---

### Task 8: Inventory Edit Page

**Files:**
- Modify: `miniprogram/pages/inventory/edit.js`, `edit.wxml`, `edit.wxss`, `edit.json`

- [ ] **Step 1: Write edit.json**

```json
{
  "navigationBarTitleText": "编辑食材"
}
```

- [ ] **Step 2: Write edit.js**

```javascript
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
```

- [ ] **Step 3: Write edit.wxml**

```xml
<view class="page">
  <view class="form-section">
    <view class="form-label">食材名称</view>
    <input class="form-input" placeholder="如：番茄" value="{{name}}" bindinput="onInputName" />
  </view>

  <view class="form-section">
    <view class="form-label">分类</view>
    <view class="chip-group">
      <view wx:for="{{quickCategories}}" wx:key="*this"
            class="chip {{category === item ? 'active' : ''}}"
            data-value="{{item}}" bindtap="onSelectCategory">
        {{item}}
      </view>
    </view>
  </view>

  <view class="form-section">
    <view class="form-label">数量</view>
    <view class="quantity-row">
      <input class="form-input quantity-input" type="digit" placeholder="0" value="{{quantity}}" bindinput="onInputQuantity" />
      <view class="chip-group">
        <view wx:for="{{quickUnits}}" wx:key="*this"
              class="chip {{unit === item ? 'active' : ''}}"
              data-value="{{item}}" bindtap="onSelectUnit">
          {{item}}
        </view>
      </view>
    </view>
  </view>

  <view class="form-section">
    <view class="form-label">存放位置</view>
    <view class="chip-group">
      <view wx:for="{{quickLocations}}" wx:key="*this"
            class="chip {{storageLocation === item ? 'active' : ''}}"
            data-value="{{item}}" bindtap="onSelectLocation">
        {{item}}
      </view>
    </view>
  </view>

  <view class="form-section">
    <view class="form-label">过期日期</view>
    <view class="chip-group">
      <view wx:for="{{quickExpires}}" wx:key="label"
            class="chip" data-days="{{item.days}}" bindtap="onSelectQuickExpire">
        {{item.label}}
      </view>
    </view>
    <picker mode="date" value="{{expireDate}}" bindchange="onDateChange">
      <view class="date-picker">{{expireDate || '选择日期'}}</view>
    </picker>
  </view>

  <view class="actions">
    <button class="btn-primary" bindtap="onSave">保存</button>
    <button wx:if="{{isEdit}}" class="btn-danger" bindtap="onDelete">删除</button>
  </view>
</view>
```

- [ ] **Step 4: Write edit.wxss**

```css
.page { padding: 48rpx; background: var(--color-canvas-parchment); min-height: 100vh; }

.form-section { margin-bottom: 40rpx; }
.form-label { font: var(--font-caption); color: var(--color-ink-muted-48); margin-bottom: 16rpx; }
.form-input { background: var(--color-canvas); border: 1rpx solid var(--color-hairline); border-radius: var(--radius-pill); padding: 18rpx 32rpx; font: var(--font-body); }

.chip-group { display: flex; flex-wrap: wrap; gap: 16rpx; }
.chip { padding: 12rpx 28rpx; border-radius: var(--radius-pill); font: var(--font-caption); background: var(--color-canvas); border: 1rpx solid var(--color-hairline); }
.chip.active { background: var(--color-primary); color: #ffffff; border-color: var(--color-primary); }

.quantity-row { display: flex; flex-direction: column; gap: 16rpx; }
.quantity-input { width: 200rpx; }

.date-picker { padding: 18rpx 32rpx; background: var(--color-canvas); border: 1rpx solid var(--color-hairline); border-radius: var(--radius-pill); font: var(--font-body); margin-top: 16rpx; }

.actions { margin-top: 64rpx; display: flex; flex-direction: column; gap: 16rpx; }
.btn-danger { background: var(--color-danger); color: #ffffff; border-radius: var(--radius-pill); border: none; }
```

- [ ] **Step 5: Verify**

- Add new item -> fills form with quick chips -> saves -> appears in list
- Edit existing item -> pre-filled data -> modify -> saves
- Delete item -> confirmation -> removed from list

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/inventory/edit.*
git commit -m "feat: inventory edit page with quick input chips"
```

---

## Phase 3: Recipes & Ordering (菜谱与点菜)

### Task 9: Seed Recipe Data

**Files:**
- Create: `miniprogram/utils/seed-recipes.js`

- [ ] **Step 1: Create seed recipes helper**

```javascript
const SEED_RECIPES = [
  {
    name: '番茄炒蛋',
    description: '经典家常快手菜',
    category: '家常菜',
    difficulty: 'easy',
    estimatedMinutes: 15,
    ingredients: [
      { name: '番茄', amount: 2, unit: '个' },
      { name: '鸡蛋', amount: 3, unit: '个' },
    ],
    steps: [
      { order: 1, desc: '番茄切块', tips: '不要切太小' },
      { order: 2, desc: '鸡蛋打散加盐', tips: '' },
      { order: 3, desc: '热锅炒蛋', tips: '油温不要太高' },
      { order: 4, desc: '加入番茄翻炒', tips: '出锅前可加少量糖提升鲜味' },
    ],
  },
  {
    name: '清炒时蔬',
    description: '简单清爽的蔬菜小炒',
    category: '家常菜',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '青菜', amount: 1, unit: '斤' },
      { name: '蒜', amount: 3, unit: '瓣' },
    ],
    steps: [
      { order: 1, desc: '青菜洗净切段', tips: '' },
      { order: 2, desc: '蒜切末', tips: '' },
      { order: 3, desc: '热锅爆香蒜末', tips: '' },
      { order: 4, desc: '下青菜翻炒至熟', tips: '大火快炒保持脆嫩' },
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
      { order: 1, desc: '紫菜撕碎泡水', tips: '' },
      { order: 2, desc: '鸡蛋打散', tips: '' },
      { order: 3, desc: '水烧开后放入紫菜', tips: '' },
      { order: 4, desc: '淋入蛋液，加盐调味', tips: '蛋液要慢慢淋入' },
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
git commit -m "feat: seed recipe data for initial setup"
```

---

### Task 10: Recipe Tile Component

**Files:**
- Create: `miniprogram/components/recipe-tile/recipe-tile.js`, `.json`, `.wxml`, `.wxss`

- [ ] **Step 1: Write recipe-tile.json**

```json
{
  "component": true
}
```

- [ ] **Step 2: Write recipe-tile.js**

```javascript
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
```

- [ ] **Step 3: Write recipe-tile.wxml**

```xml
<view class="tile {{available ? (selected ? 'tile-selected' : 'tile-light') : 'tile-dark'}}" bindtap="onTap">
  <view class="tile-content">
    <view class="recipe-name">{{recipe.name}}</view>
    <view class="recipe-desc">{{recipe.description}}</view>
    <view class="recipe-meta">
      <text>{{recipe.estimatedMinutes}}分钟</text>
      <text wx:if="{{recipe.difficulty === 'easy'}}">简单</text>
      <text wx:elif="{{recipe.difficulty === 'medium'}}">中等</text>
      <text wx:else>困难</text>
    </view>

    <view wx:if="{{!available}}" class="missing-info">
      <text class="missing-label">缺少：</text>
      <text wx:for="{{missingIngredients}}" wx:key="name" class="missing-item">{{item.name}}</text>
    </view>

    <view wx:if="{{selected}}" class="note-area" catchtap="">
      <input class="note-input" placeholder="添加备注，如：少放盐" value="{{recipe._note}}" bindinput="onNoteInput" />
    </view>

    <view class="check-mark" wx:if="{{selected}}">已选</view>
  </view>
</view>
```

- [ ] **Step 4: Write recipe-tile.wxss**

```css
.tile { padding: 80rpx 48rpx; transition: background 0.2s; }
.tile-light { background: var(--color-canvas); }
.tile-selected { background: var(--color-canvas); border-left: 8rpx solid var(--color-primary); }
.tile-dark { background: var(--color-surface-tile-dark); color: var(--color-on-dark); opacity: 0.7; }

.tile-content { position: relative; }
.recipe-name { font: var(--font-display-lg); margin-bottom: 12rpx; }
.recipe-desc { font: var(--font-body); color: var(--color-ink-muted-48); margin-bottom: 16rpx; }
.tile-dark .recipe-desc { color: rgba(255,255,255,0.6); }
.recipe-meta { font: var(--font-caption); color: var(--color-ink-muted-48); display: flex; gap: 24rpx; }
.tile-dark .recipe-meta { color: rgba(255,255,255,0.5); }

.missing-info { margin-top: 24rpx; font: var(--font-caption); }
.missing-label { color: var(--color-danger); }
.missing-item { color: var(--color-danger); margin-right: 12rpx; }

.note-area { margin-top: 24rpx; }
.note-input { background: var(--color-canvas-parchment); border-radius: var(--radius-pill); padding: 16rpx 24rpx; font: var(--font-caption); }

.check-mark { position: absolute; top: 0; right: 0; background: var(--color-primary); color: #ffffff; font: var(--font-caption); padding: 4rpx 16rpx; border-radius: var(--radius-pill); }
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/components/recipe-tile/
git commit -m "feat: recipe tile component with availability state"
```

---

### Task 11: Order Page

**Files:**
- Modify: `miniprogram/pages/order/order.js`, `order.wxml`, `order.wxss`, `order.json`

- [ ] **Step 1: Write order.json**

```json
{
  "navigationBarTitleText": "点菜",
  "usingComponents": {
    "recipe-tile": "/miniprogram/components/recipe-tile/recipe-tile"
  }
}
```

- [ ] **Step 2: Write order.js**

```javascript
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
      wx.redirectTo({ url: '/miniprogram/pages/profile/profile' });
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

    wx.showToast({ title: '点菜成功', icon: 'success' });
    this.setData({ selectedIds: [], selectedRecipes: {}, totalCount: 0, totalMinutes: 0 });
  },
});
```

- [ ] **Step 3: Write order.wxml**

```xml
<view class="page">
  <view wx:for="{{recipes}}" wx:key="_id">
    <recipe-tile
      recipe="{{item}}"
      available="{{item.available}}"
      selected="{{selectedIds.indexOf(item._id) >= 0}}"
      missingIngredients="{{item.missingIngredients}}"
      bind:toggle="onToggleRecipe"
      bind:notechange="onNoteChange" />
  </view>

  <view wx:if="{{recipes.length === 0}}" class="empty-state">
    <text>暂无菜品，请先添加菜谱</text>
  </view>

  <view wx:if="{{totalCount > 0}}" class="bottom-bar">
    <view class="bar-info">
      <text>已选 {{totalCount}} 道菜</text>
      <text wx:if="{{totalMinutes > 0}}">· 约 {{totalMinutes}} 分钟</text>
    </view>
    <button class="btn-primary" bindtap="onSubmitOrder">提交订单</button>
  </view>
</view>
```

- [ ] **Step 4: Write order.wxss**

```css
.page { background: var(--color-canvas); min-height: 100vh; padding-bottom: 160rpx; }

.empty-state { text-align: center; padding: 200rpx 0; color: var(--color-ink-muted-48); font: var(--font-caption); }

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-canvas-parchment);
  padding: 24rpx 48rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid var(--color-hairline);
  z-index: 100;
}
.bar-info { font: var(--font-body); }
```

- [ ] **Step 5: Verify**

- Load order page -> shows recipe tiles with availability
- Tap available recipe -> selected state with blue border
- Tap again -> deselects
- Type note -> note appears
- Submit -> order created -> toast success

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/order/
git commit -m "feat: order page with recipe tiles and selection"
```

---

### Task 12: createOrder Cloud Function

**Files:**
- Create: `cloudfunctions/createOrder/index.js`, `cloudfunctions/createOrder/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "createOrder",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

function calculateInventoryStatus(item) {
  if (item.quantity <= 0) return 'out_of_stock';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (!item.expireDate) return 'normal';
  const expireDate = new Date(item.expireDate);
  expireDate.setHours(0, 0, 0, 0);
  if (expireDate < now) return 'expired';
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  if (expireDate <= threeDaysLater) return 'expiring';
  return 'normal';
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { items } = event;

  if (!items || items.length === 0) return { error: '请至少选择一道菜' };

  try {
    const userRes = await db.collection('users').doc(openid).get();
    const user = userRes.data;
    if (!user.familyId) return { error: '请先加入家庭组' };

    const recipeIds = items.map(i => i.recipeId);
    const recipesRes = await db.collection('recipes')
      .where({ _id: _.in(recipeIds) })
      .get();
    const recipes = recipesRes.data;

    const inventoryRes = await db.collection('inventory')
      .where({ familyId: user.familyId })
      .get();
    const inventory = inventoryRes.data;

    for (const recipe of recipes) {
      if (!recipe.ingredients) continue;
      for (const ingredient of recipe.ingredients) {
        const invItem = inventory.find(i => i._id === ingredient.inventoryItemId);
        if (!invItem) return { error: `缺少食材：${ingredient.name}` };
        const status = calculateInventoryStatus(invItem);
        if (status === 'expired' || status === 'out_of_stock') {
          return { error: `食材不可用：${ingredient.name}` };
        }
        if (invItem.quantity < ingredient.amount) {
          return { error: `库存不足：${ingredient.name}（需要${ingredient.amount}${ingredient.unit}，库存${invItem.quantity}${invItem.unit}）` };
        }
      }
    }

    const orderRes = await db.collection('orders').add({
      data: {
        familyId: user.familyId,
        createdBy: openid,
        status: 'pending',
        items: items.map(i => ({
          recipeId: i.recipeId,
          name: i.name,
          quantity: i.quantity || 1,
          note: i.note || '',
        })),
        note: '',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    return { orderId: orderRes._id };
  } catch (err) {
    console.error('createOrder error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Deploy and test**

Deploy. Test with `{ "items": [{ "recipeId": "...", "name": "番茄炒蛋", "quantity": 1, "note": "少放盐" }] }`.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/createOrder/
git commit -m "feat: createOrder cloud function with stock validation"
```

---

## Phase 4: Kitchen & Orders (厨房与订单)

### Task 13: Status Tag Component

**Files:**
- Create: `miniprogram/components/status-tag/status-tag.js`, `.json`, `.wxml`, `.wxss`

- [ ] **Step 1: Create component files**

`status-tag.json`:
```json
{ "component": true }
```

`status-tag.js`:
```javascript
Component({
  properties: {
    status: { type: String, value: 'pending' },
  },
  data: {
    label: '待做',
    cssClass: 'tag-pending',
  },
  observers: {
    status(val) {
      const map = {
        pending: { label: '待做', cssClass: 'tag-pending' },
        cooking: { label: '做菜中', cssClass: 'tag-cooking' },
        done: { label: '已完成', cssClass: 'tag-done' },
        cancelled: { label: '已取消', cssClass: 'tag-cancelled' },
      };
      const info = map[val] || map.pending;
      this.setData(info);
    },
  },
});
```

`status-tag.wxml`:
```xml
<view class="tag {{cssClass}}">{{label}}</view>
```

`status-tag.wxss`:
```css
.tag { display: inline-block; padding: 4rpx 20rpx; border-radius: var(--radius-pill); font: var(--font-caption); }
.tag-pending { background: #e3f2fd; color: #1976d2; }
.tag-cooking { background: #fff3e0; color: #f57c00; }
.tag-done { background: #e8f5e9; color: #388e3c; }
.tag-cancelled { background: #f5f5f5; color: var(--color-ink-muted-48); }
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/components/status-tag/
git commit -m "feat: status tag component for order states"
```

---

### Task 14: Order Card Component

**Files:**
- Create: `miniprogram/components/order-card/order-card.js`, `.json`, `.wxml`, `.wxss`

- [ ] **Step 1: Create component files**

`order-card.json`:
```json
{
  "component": true,
  "usingComponents": {
    "status-tag": "/miniprogram/components/status-tag/status-tag"
  }
}
```

`order-card.js`:
```javascript
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
```

`order-card.wxml`:
```xml
<view class="order-card" bindtap="onTap">
  <view class="card-header">
    <status-tag status="{{order.status}}" />
    <text class="card-time">{{order.createdAt}}</text>
  </view>
  <view class="card-items">
    <view wx:for="{{order.items}}" wx:key="recipeId" class="order-item">
      <text class="item-name">{{item.name}}</text>
      <text wx:if="{{item.note}}" class="item-note">（{{item.note}}）</text>
    </view>
  </view>
  <view wx:if="{{order.note}}" class="order-note">
    <text>备注：{{order.note}}</text>
  </view>
</view>
```

`order-card.wxss`:
```css
.order-card { background: var(--color-canvas); border-radius: var(--radius-lg); padding: 32rpx; margin-bottom: 16rpx; border: 1rpx solid var(--color-hairline); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.card-time { font: var(--font-caption); color: var(--color-ink-muted-48); }
.card-items { display: flex; flex-direction: column; gap: 8rpx; }
.order-item { font: var(--font-body); }
.item-note { font: var(--font-caption); color: var(--color-ink-muted-48); }
.order-note { margin-top: 12rpx; font: var(--font-caption); color: var(--color-ink-muted-48); }
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/components/order-card/
git commit -m "feat: order card component with status tag"
```

---

### Task 15: Kitchen Page

**Files:**
- Modify: `miniprogram/pages/kitchen/kitchen.js`, `kitchen.wxml`, `kitchen.wxss`, `kitchen.json`

- [ ] **Step 1: Write kitchen.json**

```json
{
  "navigationBarTitleText": "厨房",
  "usingComponents": {
    "order-card": "/miniprogram/components/order-card/order-card",
    "status-tag": "/miniprogram/components/status-tag/status-tag"
  }
}
```

- [ ] **Step 2: Write kitchen.js**

```javascript
const { getCurrentUser, getFamilyOrders, getFamilyInventory } = require('../../utils/db');
const { calculateInventoryStatus } = require('../../utils/inventory');

const STATUS_TABS = [
  { key: 'pending', label: '待做' },
  { key: 'cooking', label: '做菜中' },
  { key: 'done', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

Page({
  data: {
    statusTabs: STATUS_TABS,
    activeTab: 'pending',
    orders: [],
    expiringCount: 0,
  },

  async onLoad() {
    this.user = await getCurrentUser();
    if (!this.user.familyId) {
      wx.redirectTo({ url: '/miniprogram/pages/profile/profile' });
      return;
    }
  },

  async onShow() {
    await this.loadOrders();
    await this.checkExpiring();
  },

  async loadOrders() {
    const orders = await getFamilyOrders(this.user.familyId);
    this.setData({ orders });
  },

  onTabTap(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onOrderTap(e) {
    const { orderId } = e.detail;
    const order = this.data.orders.find(o => o._id === orderId);
    if (!order) return;

    const firstRecipeId = order.items[0]?.recipeId;
    if (firstRecipeId) {
      wx.navigateTo({
        url: `/miniprogram/pages/recipe/detail?id=${firstRecipeId}&orderId=${orderId}`,
      });
    }
  },

  async checkExpiring() {
    const inventory = await getFamilyInventory(this.user.familyId);
    const expiringCount = inventory.filter(i => {
      const status = calculateInventoryStatus(i);
      return status === 'expiring' || status === 'expired';
    }).length;
    this.setData({ expiringCount });
  },

  onGoInventory() {
    wx.navigateTo({ url: '/miniprogram/pages/inventory/list' });
  },
});
```

- [ ] **Step 3: Write kitchen.wxml**

```xml
<view class="page">
  <view wx:if="{{expiringCount > 0}}" class="alert-card" bindtap="onGoInventory">
    <text class="alert-text">有 {{expiringCount}} 件食材需要关注</text>
    <text class="alert-link">查看库存 ></text>
  </view>

  <view class="tabs">
    <view wx:for="{{statusTabs}}" wx:key="key"
          class="tab {{activeTab === item.key ? 'active' : ''}}"
          data-tab="{{item.key}}" bindtap="onTabTap">
      {{item.label}}
    </view>
  </view>

  <view class="order-list">
    <block wx:for="{{orders}}" wx:key="_id">
      <order-card wx:if="{{item.status === activeTab}}" order="{{item}}" bind:tap="onOrderTap" />
    </block>

    <view wx:if="{{orders.filter(o => o.status === activeTab).length === 0}}" class="empty-state">
      <text>暂无订单</text>
    </view>
  </view>

  <view class="inventory-entry" bindtap="onGoInventory">
    <text>库存管理</text>
    <view wx:if="{{expiringCount > 0}}" class="badge">{{expiringCount}}</view>
  </view>
</view>
```

- [ ] **Step 4: Write kitchen.wxss**

```css
.page { background: var(--color-canvas-parchment); min-height: 100vh; padding-bottom: 100rpx; }

.alert-card { background: #fff3e0; padding: 24rpx 48rpx; display: flex; justify-content: space-between; align-items: center; }
.alert-text { color: var(--color-warning); font: var(--font-caption); }
.alert-link { color: var(--color-primary); font: var(--font-caption); }

.tabs { display: flex; background: var(--color-canvas); border-bottom: 1rpx solid var(--color-hairline); }
.tab { flex: 1; text-align: center; padding: 24rpx 0; font: var(--font-caption); color: var(--color-ink-muted-48); }
.tab.active { color: var(--color-primary); border-bottom: 4rpx solid var(--color-primary); }

.order-list { padding: 24rpx 48rpx; }
.empty-state { text-align: center; padding: 120rpx 0; color: var(--color-ink-muted-48); font: var(--font-caption); }

.inventory-entry {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-canvas);
  padding: 32rpx 48rpx;
  text-align: center;
  font: var(--font-body-strong);
  color: var(--color-primary);
  border-top: 1rpx solid var(--color-hairline);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
}
.badge { background: var(--color-danger); color: #ffffff; font: var(--font-caption); min-width: 32rpx; height: 32rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
```

- [ ] **Step 5: Verify**

- Kitchen page shows tabs: 待做 / 做菜中 / 已完成 / 已取消
- Orders appear under correct tab
- Tap order -> navigates to recipe detail
- Expiring alert card shows when inventory has expiring items
- Inventory entry at bottom with badge count

- [ ] **Step 6: Commit**

```bash
git add miniprogram/pages/kitchen/
git commit -m "feat: kitchen page with order tabs and expiring alert"
```

---

### Task 16: Recipe Detail Page

**Files:**
- Modify: `miniprogram/pages/recipe/detail.js`, `detail.wxml`, `detail.wxss`, `detail.json`

- [ ] **Step 1: Write detail.json**

```json
{
  "navigationBarTitleText": "菜谱详情"
}
```

- [ ] **Step 2: Write detail.js**

```javascript
const { getCollection, COLLECTIONS } = require('../../utils/db');

Page({
  data: {
    recipe: null,
    orderId: '',
    orderStatus: '',
    canStartCooking: false,
    canCompleteCooking: false,
  },

  async onLoad(options) {
    const { id, orderId } = options;
    await this.loadRecipe(id);
    if (orderId) {
      await this.loadOrder(orderId);
    }
  },

  async loadRecipe(id) {
    const res = await getCollection(COLLECTIONS.RECIPES).doc(id).get();
    this.setData({ recipe: res.data });
  },

  async loadOrder(orderId) {
    const res = await getCollection(COLLECTIONS.ORDERS).doc(orderId).get();
    const order = res.data;
    this.setData({
      orderId,
      orderStatus: order.status,
      canStartCooking: order.status === 'pending',
      canCompleteCooking: order.status === 'cooking',
    });
  },

  async onStartCooking() {
    wx.showLoading({ title: '处理中...' });
    const res = await wx.cloud.callFunction({
      name: 'updateOrderStatus',
      data: { orderId: this.data.orderId, newStatus: 'cooking' },
    });
    wx.hideLoading();

    if (res.result.error) {
      wx.showToast({ title: res.result.error, icon: 'none' });
      return;
    }

    this.setData({ orderStatus: 'cooking', canStartCooking: false, canCompleteCooking: true });
    wx.showToast({ title: '开始做菜', icon: 'success' });
  },

  async onCompleteCooking() {
    wx.showModal({
      title: '完成做菜',
      content: '确认完成？系统将自动扣减库存。',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中...' });
        const result = await wx.cloud.callFunction({
          name: 'updateOrderStatus',
          data: { orderId: this.data.orderId, newStatus: 'done' },
        });
        wx.hideLoading();

        if (result.result.error) {
          wx.showToast({ title: result.result.error, icon: 'none' });
          return;
        }

        this.setData({ orderStatus: 'done', canCompleteCooking: false });
        wx.showToast({ title: '做菜完成', icon: 'success' });
      },
    });
  },

  onBackToKitchen() {
    wx.navigateBack();
  },
});
```

- [ ] **Step 3: Write detail.wxml**

```xml
<view class="page" wx:if="{{recipe}}">
  <view class="hero">
    <image wx:if="{{recipe.coverUrl}}" src="{{recipe.coverUrl}}" class="hero-img" mode="aspectFill" />
    <view class="hero-title">{{recipe.name}}</view>
    <view class="hero-desc">{{recipe.description}}</view>
    <view class="hero-meta">
      <text>{{recipe.estimatedMinutes}}分钟</text>
      <text>{{recipe.category}}</text>
    </view>
  </view>

  <view class="section">
    <view class="section-title">食材清单</view>
    <view wx:for="{{recipe.ingredients}}" wx:key="name" class="ingredient-row">
      <text class="ingredient-name">{{item.name}}</text>
      <text class="ingredient-amount">{{item.amount}}{{item.unit}}</text>
    </view>
  </view>

  <view class="section">
    <view class="section-title">制作步骤</view>
    <view wx:for="{{recipe.steps}}" wx:key="order" class="step">
      <view class="step-num">{{item.order}}</view>
      <view class="step-content">
        <text class="step-desc">{{item.desc}}</text>
        <text wx:if="{{item.tips}}" class="step-tips">小贴士：{{item.tips}}</text>
      </view>
    </view>
  </view>

  <view wx:if="{{orderId}}" class="actions">
    <button wx:if="{{canStartCooking}}" class="btn-primary" bindtap="onStartCooking">开始做菜</button>
    <button wx:if="{{canCompleteCooking}}" class="btn-primary" bindtap="onCompleteCooking">完成做菜</button>
    <button wx:if="{{orderStatus === 'done'}}" class="btn-secondary" bindtap="onBackToKitchen">返回厨房</button>
  </view>
</view>
```

- [ ] **Step 4: Write detail.wxss**

```css
.page { background: var(--color-canvas); min-height: 100vh; padding-bottom: 160rpx; }

.hero { padding: 80rpx 48rpx; background: var(--color-canvas-parchment); }
.hero-img { width: 100%; height: 400rpx; border-radius: var(--radius-lg); margin-bottom: 32rpx; }
.hero-title { font: var(--font-display-lg); margin-bottom: 12rpx; }
.hero-desc { font: var(--font-body); color: var(--color-ink-muted-48); margin-bottom: 16rpx; }
.hero-meta { font: var(--font-caption); color: var(--color-ink-muted-48); display: flex; gap: 24rpx; }

.section { padding: 48rpx; }
.section-title { font: var(--font-tagline); margin-bottom: 24rpx; }

.ingredient-row { display: flex; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid var(--color-hairline); }
.ingredient-name { font: var(--font-body); }
.ingredient-amount { font: var(--font-body); color: var(--color-ink-muted-48); }

.step { display: flex; gap: 24rpx; margin-bottom: 32rpx; }
.step-num { width: 48rpx; height: 48rpx; border-radius: 50%; background: var(--color-primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font: var(--font-caption); flex-shrink: 0; }
.step-content { flex: 1; }
.step-desc { font: var(--font-body); display: block; }
.step-tips { font: var(--font-caption); color: var(--color-ink-muted-48); display: block; margin-top: 8rpx; }

.actions { position: fixed; bottom: 0; left: 0; right: 0; padding: 24rpx 48rpx; background: var(--color-canvas-parchment); border-top: 1rpx solid var(--color-hairline); }
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/recipe/
git commit -m "feat: recipe detail page with cooking actions"
```

---

### Task 17: updateOrderStatus Cloud Function

**Files:**
- Create: `cloudfunctions/updateOrderStatus/index.js`, `cloudfunctions/updateOrderStatus/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "updateOrderStatus",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const VALID_TRANSITIONS = {
  pending: ['cooking', 'cancelled'],
  cooking: ['done', 'cancelled'],
  done: [],
  cancelled: [],
};

function calculateInventoryStatus(item) {
  if (item.quantity <= 0) return 'out_of_stock';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (!item.expireDate) return 'normal';
  const expireDate = new Date(item.expireDate);
  expireDate.setHours(0, 0, 0, 0);
  if (expireDate < now) return 'expired';
  return 'normal';
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { orderId, newStatus, cancelReason } = event;

  try {
    const userRes = await db.collection('users').doc(openid).get();
    const user = userRes.data;
    if (!user.familyId) return { error: '用户未加入家庭组' };

    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    if (order.familyId !== user.familyId) return { error: '无权操作此订单' };

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      return { error: `状态不允许从 ${order.status} 变为 ${newStatus}` };
    }

    const updateData = { status: newStatus, updatedAt: db.serverDate() };

    if (newStatus === 'cooking') {
      updateData.startedAt = db.serverDate();
      const inventoryRes = await db.collection('inventory')
        .where({ familyId: user.familyId })
        .get();
      const inventory = inventoryRes.data;

      const recipeIds = order.items.map(i => i.recipeId);
      const recipesRes = await db.collection('recipes')
        .where({ _id: _.in(recipeIds) })
        .get();

      for (const recipe of recipesRes.data) {
        if (!recipe.ingredients) continue;
        for (const ingredient of recipe.ingredients) {
          const invItem = inventory.find(i => i._id === ingredient.inventoryItemId);
          if (!invItem) return { error: `缺少食材：${ingredient.name}` };
          const status = calculateInventoryStatus(invItem);
          if (status === 'expired' || status === 'out_of_stock') {
            return { error: `食材不可用：${ingredient.name}` };
          }
          if (invItem.quantity < ingredient.amount) {
            return { error: `库存不足：${ingredient.name}` };
          }
        }
      }
    }

    if (newStatus === 'done') {
      updateData.completedAt = db.serverDate();
      const inventoryRes = await db.collection('inventory')
        .where({ familyId: user.familyId })
        .get();
      const inventory = inventoryRes.data;

      const recipeIds = order.items.map(i => i.recipeId);
      const recipesRes = await db.collection('recipes')
        .where({ _id: _.in(recipeIds) })
        .get();

      for (const recipe of recipesRes.data) {
        if (!recipe.ingredients) continue;
        for (const ingredient of recipe.ingredients) {
          const invItem = inventory.find(i => i._id === ingredient.inventoryItemId);
          if (!invItem) continue;

          const newQuantity = invItem.quantity - ingredient.amount;
          if (newQuantity < 0) {
            return { error: `库存不足，无法扣减：${ingredient.name}（需要${ingredient.amount}，库存${invItem.quantity}），请手动调整库存后再完成` };
          }

          const invStatus = newQuantity <= 0 ? 'out_of_stock' : 'normal';

          await db.collection('inventory').doc(invItem._id).update({
            data: {
              quantity: newQuantity,
              status: invStatus,
              updatedAt: db.serverDate(),
            },
          });
        }
      }
    }

    if (newStatus === 'cancelled') {
      updateData.cancelledAt = db.serverDate();
      if (cancelReason) updateData.cancelReason = cancelReason;
    }

    await db.collection('orders').doc(orderId).update({ data: updateData });
    return { success: true };
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Deploy and test**

Deploy. Test with `{ "orderId": "...", "newStatus": "cooking" }` then `{ "orderId": "...", "newStatus": "done" }`. Verify inventory quantities decrease.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/updateOrderStatus/
git commit -m "feat: updateOrderStatus cloud function with inventory deduction"
```

---

## Phase 5: Reminders & Security (提醒与安全)

### Task 18: checkExpiringInventory Cloud Function

**Files:**
- Create: `cloudfunctions/checkExpiringInventory/index.js`, `cloudfunctions/checkExpiringInventory/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "checkExpiringInventory",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const expiringRes = await db.collection('inventory')
      .where({
        expireDate: _.gte(now).and(_.lte(threeDaysLater)),
        quantity: _.gt(0),
      })
      .get();

    if (expiringRes.data.length === 0) return { sent: 0 };

    const byFamily = {};
    for (const item of expiringRes.data) {
      if (!byFamily[item.familyId]) byFamily[item.familyId] = [];
      byFamily[item.familyId].push(item);
    }

    let sentCount = 0;

    for (const [familyId, items] of Object.entries(byFamily)) {
      const usersRes = await db.collection('users')
        .where({
          familyId,
          subscribeExpireReminder: true,
        })
        .get();

      const names = items.map(i => i.name).join('、');
      const content = `您有 ${items.length} 件食材即将过期：${names}。请尽快使用。`;

      for (const user of usersRes.data) {
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: user._id,
            templateId: 'YOUR_TEMPLATE_ID',
            data: { thing1: { value: content } },
            page: '/miniprogram/pages/inventory/list',
          });
          sentCount++;
        } catch (err) {
          console.error(`Send message to ${user._id} failed:`, err);
        }
      }
    }

    return { sent: sentCount };
  } catch (err) {
    console.error('checkExpiringInventory error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Configure trigger**

In WeChat DevTools cloud function settings, set trigger:
```json
{"triggers":[{"name":"dailyCheck","type":"timer","config":"0 0 9 * * * *"}]}
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/checkExpiringInventory/
git commit -m "feat: checkExpiringInventory cloud function with daily trigger"
```

---

### Task 19: updateInventoryStatus Cloud Function

**Files:**
- Create: `cloudfunctions/updateInventoryStatus/index.js`, `cloudfunctions/updateInventoryStatus/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "updateInventoryStatus",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create index.js**

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    await db.collection('inventory').where({
      quantity: _.lte(0),
      status: _.neq('out_of_stock'),
    }).update({
      data: { status: 'out_of_stock', updatedAt: db.serverDate() },
    });

    await db.collection('inventory').where({
      expireDate: _.lt(now),
      status: _.neq('expired'),
      quantity: _.gt(0),
    }).update({
      data: { status: 'expired', updatedAt: db.serverDate() },
    });

    await db.collection('inventory').where({
      expireDate: _.gte(now).and(_.lte(threeDaysLater)),
      status: _.neq('expiring'),
      quantity: _.gt(0),
    }).update({
      data: { status: 'expiring', updatedAt: db.serverDate() },
    });

    await db.collection('inventory').where({
      expireDate: _.gt(threeDaysLater),
      quantity: _.gt(0),
      status: _.neq('normal'),
    }).update({
      data: { status: 'normal', updatedAt: db.serverDate() },
    });

    return { success: true };
  } catch (err) {
    console.error('updateInventoryStatus error:', err);
    return { error: err.message };
  }
};
```

- [ ] **Step 3: Deploy and test**

Deploy. Run manually to verify status updates.

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/updateInventoryStatus/
git commit -m "feat: updateInventoryStatus cloud function for batch status refresh"
```

---

### Task 20: Cloud Database Security Rules

**Files:**
- Create: `miniprogram/utils/security-note.md`

- [ ] **Step 1: Document security rules**

Manual setup in WeChat Cloud Console -> Database -> Permissions:

```markdown
# Cloud Database Security Rules

## users
- Read: auth.openid == doc._id
- Write: auth.openid == doc._id

## families
- Read: auth.openid in doc.members
- Write: auth.openid == doc.createdBy

## recipes
- Read: auth.openid in (families where familyId matches).members
- Write: auth.openid in (families where familyId matches).members

## orders
- Read: auth.openid in (families where familyId matches).members
- Write: auth.openid in (families where familyId matches).members

## inventory
- Read: auth.openid in (families where familyId matches).members
- Write: auth.openid in (families where familyId matches).members
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/utils/security-note.md
git commit -m "docs: cloud database security rules configuration guide"
```

---

## Self-Review

### Spec Coverage

| Spec Section | Task(s) |
|-------------|---------|
| 家庭组创建/加入 | Task 4, 5, 6 |
| 菜谱浏览 | Task 9, 10, 11 |
| 点菜提交 | Task 11, 12 |
| 厨房接单做菜 | Task 13, 14, 15, 16, 17 |
| 库存管理 | Task 7, 8 |
| 过期提醒 | Task 18, 19 |
| 数据隔离 | Task 20 |
| Apple Design System | Task 1 (tokens), Task 10 (tile component) |
| 订单状态流转 | Task 17 |
| 三点库存校验 | Task 12, 17 |
| 快速录入 | Task 8 |
| 验收标准 | Covered across all tasks |

### Placeholder Scan
- `YOUR_TEMPLATE_ID` in Task 18 Step 2 -- needs replacement with actual WeChat subscribe message template ID

### Type Consistency
- `familyId` consistent across all files
- Status values: pending/cooking/done/cancelled -- consistent
- Inventory status: normal/expiring/expired/out_of_stock -- consistent
- Collection names: users, families, recipes, orders, inventory -- consistent
