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
