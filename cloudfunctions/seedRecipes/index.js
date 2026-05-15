const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { recipes } = event;

  if (!recipes || recipes.length === 0) return { error: '没有菜谱数据' };

  try {
    const userRes = await db.collection('users').doc(openid).get();
    const user = userRes.data;
    if (!user.familyId) return { error: '请先加入家庭组' };

    // 分批写入，每批10个
    for (let i = 0; i < recipes.length; i += 10) {
      const batch = recipes.slice(i, i + 10);
      const tasks = batch.map(recipe =>
        db.collection('recipes').add({
          data: {
            name: recipe.name,
            description: recipe.description || '',
            category: recipe.category || '家常菜',
            difficulty: recipe.difficulty || 'easy',
            estimatedMinutes: recipe.estimatedMinutes || 15,
            ingredients: recipe.ingredients || [],
            steps: recipe.steps || [],
            tutorials: recipe.tutorials || [],
            coverUrl: '',
            familyId: user.familyId,
            createdBy: openid,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate(),
          },
        })
      );
      await Promise.all(tasks);
    }
    return { success: true, count: recipes.length };
  } catch (err) {
    console.error('seedRecipes error:', err);
    return { error: err.message };
  }
};
