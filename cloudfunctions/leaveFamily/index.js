const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const userRes = await db.collection('users').doc(openid).get();
    const user = userRes.data;
    if (!user.familyId) return { error: '您未加入任何家庭组' };

    // 从家庭成员列表中移除
    await db.collection('families').doc(user.familyId).update({
      data: { members: _.pull(openid) },
    });

    // 清除用户的 familyId
    await db.collection('users').doc(openid).update({
      data: { familyId: '' },
    });

    return { success: true };
  } catch (err) {
    console.error('leaveFamily error:', err);
    return { error: err.message };
  }
};
