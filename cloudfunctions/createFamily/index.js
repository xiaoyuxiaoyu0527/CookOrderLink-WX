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
