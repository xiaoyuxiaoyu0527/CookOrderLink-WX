const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const VALID_ROLES = ['husband', 'wife'];

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const updateData = {};

  if (event.role !== undefined) {
    if (!VALID_ROLES.includes(event.role)) {
      return { error: '无效的角色' };
    }
    updateData.role = event.role;
  }

  if (event.subscribeExpireReminder !== undefined) {
    updateData.subscribeExpireReminder = !!event.subscribeExpireReminder;
  }

  if (event.nickName !== undefined) {
    const nickName = String(event.nickName).trim();
    if (nickName.length > 20) return { error: '昵称不能超过20个字' };
    if (nickName.length > 0) updateData.nickName = nickName;
  }

  if (event.avatarUrl !== undefined) {
    if (event.avatarUrl) updateData.avatarUrl = event.avatarUrl;
  }

  if (Object.keys(updateData).length === 0) {
    return { error: '没有需要更新的字段' };
  }

  try {
    await db.collection('users').doc(openid).update({
      data: updateData,
    });
    return { success: true, ...updateData };
  } catch (err) {
    console.error('switchRole error:', err);
    return { error: err.message };
  }
};
