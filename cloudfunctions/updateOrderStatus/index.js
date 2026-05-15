const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const VALID_TRANSITIONS = {
  pending: ['cooking', 'done', 'cancelled'],
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
