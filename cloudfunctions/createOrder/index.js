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

    // Notify husband of new order
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
          page: '/miniprogram/pages/kitchen/kitchen',
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
