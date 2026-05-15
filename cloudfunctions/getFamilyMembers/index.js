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
    if (!user.familyId) return { members: [] };

    const familyRes = await db.collection('families').doc(user.familyId).get();
    const family = familyRes.data;

    if (!family.members || family.members.length === 0) return { members: [] };

    const membersRes = await db.collection('users')
      .where({ _id: _.in(family.members) })
      .field({ _id: true, nickName: true, avatarUrl: true, role: true })
      .get();

    return { members: membersRes.data };
  } catch (err) {
    console.error('getFamilyMembers error:', err);
    return { error: err.message };
  }
};
