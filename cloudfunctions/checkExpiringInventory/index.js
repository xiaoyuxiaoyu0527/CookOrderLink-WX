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
            templateId: 'Rk2sodg0GmD20fL0Ve30oJ3HI8m-_qjH36zqJs_rj9g',
            data: { thing1: { value: content } },
            page: 'pages/inventory/list',
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
