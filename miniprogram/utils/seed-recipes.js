const SEED_RECIPES = [
  {
    name: '番茄炒蛋',
    description: '经典家常快手菜',
    category: '家常菜',
    difficulty: 'easy',
    estimatedMinutes: 15,
    ingredients: [
      { name: '番茄', amount: 2, unit: '个' },
      { name: '鸡蛋', amount: 3, unit: '个' },
    ],
    steps: [
      { order: 1, desc: '番茄切块', tips: '不要切太小' },
      { order: 2, desc: '鸡蛋打散加盐', tips: '' },
      { order: 3, desc: '热锅炒蛋', tips: '油温不要太高' },
      { order: 4, desc: '加入番茄翻炒', tips: '出锅前可加少量糖提升鲜味' },
    ],
  },
  {
    name: '清炒时蔬',
    description: '简单清爽的蔬菜小炒',
    category: '家常菜',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '青菜', amount: 1, unit: '斤' },
      { name: '蒜', amount: 3, unit: '瓣' },
    ],
    steps: [
      { order: 1, desc: '青菜洗净切段', tips: '' },
      { order: 2, desc: '蒜切末', tips: '' },
      { order: 3, desc: '热锅爆香蒜末', tips: '' },
      { order: 4, desc: '下青菜翻炒至熟', tips: '大火快炒保持脆嫩' },
    ],
  },
  {
    name: '紫菜蛋花汤',
    description: '清淡营养的快手汤',
    category: '汤品',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '紫菜', amount: 1, unit: '张' },
      { name: '鸡蛋', amount: 2, unit: '个' },
    ],
    steps: [
      { order: 1, desc: '紫菜撕碎泡水', tips: '' },
      { order: 2, desc: '鸡蛋打散', tips: '' },
      { order: 3, desc: '水烧开后放入紫菜', tips: '' },
      { order: 4, desc: '淋入蛋液，加盐调味', tips: '蛋液要慢慢淋入' },
    ],
  },
];

async function seedRecipes(familyId, openid) {
  const db = wx.cloud.database();
  for (const recipe of SEED_RECIPES) {
    await db.collection('recipes').add({
      data: {
        ...recipe,
        familyId,
        coverUrl: '',
        createdBy: openid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}

module.exports = { SEED_RECIPES, seedRecipes };
