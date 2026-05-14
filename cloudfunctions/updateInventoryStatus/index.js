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
