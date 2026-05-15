const db = wx.cloud.database();
const _ = db.command;

const COLLECTIONS = {
  USERS: 'users',
  FAMILIES: 'families',
  RECIPES: 'recipes',
  ORDERS: 'orders',
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
  getFamilyOrders,
};
