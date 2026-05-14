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
