const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    const userRes = await db.collection('users').where({ _id: openid }).get();

    if (userRes.data.length > 0) {
      return { userInfo: userRes.data[0] };
    }

    const newUser = {
      _id: openid,
      nickName: '',
      avatarUrl: '',
      role: '',
      familyId: '',
      subscribeExpireReminder: false,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate(),
    };

    await db.collection('users').add({ data: newUser });
    return { userInfo: newUser };
  } catch (err) {
    console.error('userLogin error:', err);
    return { error: err.message };
  }
};
