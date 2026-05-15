const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { name, description, category, difficulty, estimatedMinutes, ingredients, steps, tutorials, coverUrl } = event;

  if (!name || !name.trim()) return { error: '请输入菜谱名称' };

  try {
    const userRes = await db.collection('users').doc(openid).get();
    const user = userRes.data;
    if (!user.familyId) return { error: '请先加入家庭组' };

    const recipeRes = await db.collection('recipes').add({
      data: {
        name: name.trim(),
        description: description || '',
        category: category || '家常菜',
        difficulty: difficulty || 'easy',
        estimatedMinutes: estimatedMinutes || 15,
        ingredients: ingredients || [],
        steps: steps || [],
        tutorials: tutorials || [],
        coverUrl: coverUrl || '',
        familyId: user.familyId,
        createdBy: openid,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
      },
    });

    return { recipeId: recipeRes._id };
  } catch (err) {
    console.error('createRecipe error:', err);
    return { error: err.message };
  }
};
