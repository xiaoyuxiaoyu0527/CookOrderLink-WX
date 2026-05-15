const SEED_RECIPES = [
  {
    name: '番茄炒蛋',
    description: '经典家常快手菜，酸甜开胃',
    category: '家常菜',
    difficulty: 'easy',
    estimatedMinutes: 15,
    ingredients: [
      { name: '番茄', amount: 2, unit: '个' },
      { name: '鸡蛋', amount: 3, unit: '个' },
      { name: '葱', amount: 1, unit: '根' },
    ],
    steps: [
      { order: 1, desc: '番茄切块，鸡蛋打散加盐', tips: '番茄不要切太小' },
      { order: 2, desc: '热锅凉油，倒入蛋液炒至凝固', tips: '油温不要太高' },
      { order: 3, desc: '加入番茄翻炒出汁', tips: '' },
      { order: 4, desc: '加盐、糖调味，撒葱花出锅', tips: '加少量糖提升鲜味' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '番茄炒蛋的正确做法', url: 'https://www.bilibili.com/video/BV1xx411c7mD' },
    ],
  },
  {
    name: '红烧排骨',
    description: '色泽红亮，肉质酥烂',
    category: '荤菜',
    difficulty: 'medium',
    estimatedMinutes: 45,
    ingredients: [
      { name: '排骨', amount: 500, unit: '克' },
      { name: '姜', amount: 3, unit: '片' },
      { name: '蒜', amount: 3, unit: '瓣' },
      { name: '酱油', amount: 2, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '排骨焯水去血沫', tips: '冷水下锅' },
      { order: 2, desc: '热锅炒糖色，放入排骨翻炒', tips: '' },
      { order: 3, desc: '加酱油、料酒、姜蒜，加水没过排骨', tips: '' },
      { order: 4, desc: '大火烧开转小火炖30分钟', tips: '' },
      { order: 5, desc: '大火收汁即可', tips: '不要收太干' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '红烧排骨家常做法', url: 'https://www.bilibili.com/video/BV1EJ41127FS' },
    ],
  },
  {
    name: '清炒时蔬',
    description: '简单清爽的蔬菜小炒',
    category: '素菜',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '青菜', amount: 1, unit: '斤' },
      { name: '蒜', amount: 3, unit: '瓣' },
    ],
    steps: [
      { order: 1, desc: '青菜洗净切段，蒜切末', tips: '' },
      { order: 2, desc: '热锅爆香蒜末', tips: '' },
      { order: 3, desc: '下青菜大火翻炒至熟', tips: '大火快炒保持脆嫩' },
      { order: 4, desc: '加盐调味出锅', tips: '' },
    ],
    tutorials: [],
  },
  {
    name: '可乐鸡翅',
    description: '甜香入味，大人小孩都爱吃',
    category: '荤菜',
    difficulty: 'easy',
    estimatedMinutes: 30,
    ingredients: [
      { name: '鸡翅', amount: 8, unit: '个' },
      { name: '可乐', amount: 1, unit: '罐' },
      { name: '姜', amount: 3, unit: '片' },
      { name: '酱油', amount: 2, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '鸡翅划两刀，焯水去血沫', tips: '' },
      { order: 2, desc: '热锅煎鸡翅至两面金黄', tips: '' },
      { order: 3, desc: '倒入可乐，加酱油、姜片', tips: '可乐要没过鸡翅' },
      { order: 4, desc: '大火烧开转小火炖20分钟', tips: '' },
      { order: 5, desc: '大火收汁即可', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '可乐鸡翅简单做法', url: 'https://www.bilibili.com/video/BV1Ws41127p0' },
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
      { order: 1, desc: '紫菜撕碎泡水，鸡蛋打散', tips: '' },
      { order: 2, desc: '水烧开后放入紫菜', tips: '' },
      { order: 3, desc: '淋入蛋液，加盐调味', tips: '蛋液要慢慢淋入' },
      { order: 4, desc: '滴几滴香油出锅', tips: '' },
    ],
    tutorials: [],
  },
  {
    name: '蒜蓉西兰花',
    description: '健康低脂，蒜香浓郁',
    category: '素菜',
    difficulty: 'easy',
    estimatedMinutes: 12,
    ingredients: [
      { name: '西兰花', amount: 1, unit: '颗' },
      { name: '蒜', amount: 5, unit: '瓣' },
    ],
    steps: [
      { order: 1, desc: '西兰花掰小朵焯水', tips: '焯水加点盐保持翠绿' },
      { order: 2, desc: '蒜切末备用', tips: '' },
      { order: 3, desc: '热锅爆香蒜末，放入西兰花翻炒', tips: '' },
      { order: 4, desc: '加盐调味出锅', tips: '' },
    ],
    tutorials: [],
  },
  {
    name: '蛋炒饭',
    description: '粒粒分明，简单美味',
    category: '主食',
    difficulty: 'easy',
    estimatedMinutes: 10,
    ingredients: [
      { name: '米饭', amount: 1, unit: '碗' },
      { name: '鸡蛋', amount: 2, unit: '个' },
      { name: '葱', amount: 1, unit: '根' },
    ],
    steps: [
      { order: 1, desc: '鸡蛋打散，葱切末', tips: '' },
      { order: 2, desc: '热锅凉油，倒入蛋液炒散', tips: '' },
      { order: 3, desc: '加入米饭大火翻炒', tips: '米饭要打散' },
      { order: 4, desc: '加盐调味，撒葱花出锅', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '蛋炒饭的秘诀', url: 'https://www.bilibili.com/video/BV1pJ411K7HZ' },
    ],
  },
  {
    name: '宫保鸡丁',
    description: '麻辣鲜香，经典川菜',
    category: '荤菜',
    difficulty: 'medium',
    estimatedMinutes: 25,
    ingredients: [
      { name: '鸡胸肉', amount: 300, unit: '克' },
      { name: '花生米', amount: 50, unit: '克' },
      { name: '干辣椒', amount: 5, unit: '个' },
      { name: '花椒', amount: 10, unit: '粒' },
    ],
    steps: [
      { order: 1, desc: '鸡胸肉切丁，加料酒、淀粉腌制', tips: '' },
      { order: 2, desc: '花生米炸熟备用', tips: '' },
      { order: 3, desc: '热锅爆香干辣椒和花椒', tips: '' },
      { order: 4, desc: '放入鸡丁翻炒至变色', tips: '' },
      { order: 5, desc: '加调料和花生米翻炒出锅', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '宫保鸡丁正宗做法', url: 'https://www.bilibili.com/video/BV1Ws41127p0' },
    ],
  },
  {
    name: '麻婆豆腐',
    description: '麻辣鲜香，下饭神器',
    category: '荤菜',
    difficulty: 'medium',
    estimatedMinutes: 20,
    ingredients: [
      { name: '豆腐', amount: 1, unit: '块' },
      { name: '猪肉末', amount: 100, unit: '克' },
      { name: '豆瓣酱', amount: 1, unit: '勺' },
      { name: '花椒粉', amount: 1, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '豆腐切块焯水', tips: '' },
      { order: 2, desc: '热锅炒肉末至变色', tips: '' },
      { order: 3, desc: '加豆瓣酱炒出红油', tips: '' },
      { order: 4, desc: '加入豆腐和水烧开', tips: '' },
      { order: 5, desc: '勾芡，撒花椒粉出锅', tips: '' },
    ],
    tutorials: [
      { platform: 'bilibili', title: '麻婆豆腐家常做法', url: 'https://www.bilibili.com/video/BV1EJ41127FS' },
    ],
  },
  {
    name: '酸辣土豆丝',
    description: '开胃下饭，简单快手',
    category: '素菜',
    difficulty: 'easy',
    estimatedMinutes: 15,
    ingredients: [
      { name: '土豆', amount: 2, unit: '个' },
      { name: '干辣椒', amount: 3, unit: '个' },
      { name: '醋', amount: 2, unit: '勺' },
    ],
    steps: [
      { order: 1, desc: '土豆去皮切丝，泡水去淀粉', tips: '切得越细越好' },
      { order: 2, desc: '热锅爆香干辣椒', tips: '' },
      { order: 3, desc: '放入土豆丝大火翻炒', tips: '' },
      { order: 4, desc: '加醋和盐调味出锅', tips: '醋要最后加' },
    ],
    tutorials: [
      { platform: 'xiaohongshu', title: '酸辣土豆丝小红书教程', url: 'https://www.xiaohongshu.com/explore/酸辣土豆丝' },
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
