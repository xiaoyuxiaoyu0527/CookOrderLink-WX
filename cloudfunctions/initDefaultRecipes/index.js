const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const DEFAULT_RECIPES = [
  {
    name: '红烧肉', category: '荤菜', difficulty: 'medium', estimatedMinutes: 90,
    description: '经典家常硬菜，色泽红亮、肥而不腻、入口即化，配米饭一绝。',
    ingredients: [{ name: '五花肉', amount: 500, unit: '克' }, { name: '冰糖', amount: 20, unit: '克' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 2, unit: '勺' }, { name: '姜片', amount: 4, unit: '片' }, { name: '葱段', amount: 2, unit: '根' }, { name: '八角', amount: 2, unit: '颗' }, { name: '桂皮', amount: 1, unit: '小块' }, { name: '香叶', amount: 2, unit: '片' }],
    steps: [{ order: 1, desc: '五花肉切3厘米方块，冷水下锅加姜片料酒焯水，撇去浮沫捞出洗净', tips: '' }, { order: 2, desc: '锅中不放油，放入五花肉中小火煸炒至表面微黄、逼出油脂', tips: '' }, { order: 3, desc: '锅中留底油，放入冰糖小火炒至枣红色起小泡，迅速倒入肉块翻炒上色', tips: '炒糖色要小火慢炒，颜色过深会发苦' }, { order: 4, desc: '加入姜片、葱段、八角、桂皮、香叶炒香，淋入料酒、生抽、老抽翻匀', tips: '' }, { order: 5, desc: '倒入足量热水没过肉块，大火烧开转小火盖盖慢炖60分钟', tips: '炖煮全程加热水，冷水会让肉发柴' }, { order: 6, desc: '开盖转大火收汁，不停翻炒至汤汁浓稠裹满肉块，撒葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '红烧肉做法', url: 'https://www.bilibili.com/video/BV1Us411H7Nw/' }, { platform: 'xiaohongshu', title: '红烧肉做法', url: 'https://www.xiaohongshu.com/search_result?keyword=红烧肉做法&type=54' }],
  },
  {
    name: '番茄炒蛋', category: '家常菜', difficulty: 'easy', estimatedMinutes: 10,
    description: '国民家常菜第一名，酸甜多汁、嫩滑下饭，十分钟搞定。',
    ingredients: [{ name: '番茄', amount: 2, unit: '个' }, { name: '鸡蛋', amount: 3, unit: '个' }, { name: '葱花', amount: 1, unit: '适量' }, { name: '白糖', amount: 0.5, unit: '勺' }, { name: '盐', amount: 1, unit: '适量' }],
    steps: [{ order: 1, desc: '番茄顶部划十字，开水烫30秒去皮，切成小块', tips: '' }, { order: 2, desc: '鸡蛋打散加少许盐搅匀', tips: '' }, { order: 3, desc: '锅热倒油，油热倒入蛋液，用筷子快速划散至刚凝固，盛出备用', tips: '鸡蛋不要炒老，刚凝固就盛出最嫩' }, { order: 4, desc: '锅中少许油，倒入番茄块中火翻炒，用锅铲按压出汁', tips: '番茄一定要炒出汁才好吃' }, { order: 5, desc: '番茄炒至软烂浓稠时，加白糖、盐调味，倒回鸡蛋翻炒均匀', tips: '' }, { order: 6, desc: '撒葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '番茄炒蛋做法', url: 'https://www.bilibili.com/video/av24057567' }],
  },
  {
    name: '宫保鸡丁', category: '荤菜', difficulty: 'medium', estimatedMinutes: 25,
    description: '川菜经典名菜，鸡丁嫩滑、花生酥脆、酸甜微辣超下饭。',
    ingredients: [{ name: '鸡胸肉', amount: 300, unit: '克' }, { name: '花生米', amount: 50, unit: '克' }, { name: '干辣椒', amount: 6, unit: '个' }, { name: '花椒', amount: 1, unit: '小把' }, { name: '葱白', amount: 2, unit: '根' }, { name: '蒜', amount: 3, unit: '瓣' }, { name: '姜', amount: 3, unit: '片' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '醋', amount: 2, unit: '勺' }, { name: '白糖', amount: 1, unit: '勺' }, { name: '料酒', amount: 1, unit: '勺' }, { name: '淀粉', amount: 1, unit: '勺' }],
    steps: [{ order: 1, desc: '鸡胸肉切丁，加料酒、生抽、淀粉抓匀腌制15分钟', tips: '鸡丁腌制时加淀粉能保持嫩滑' }, { order: 2, desc: '花生米小火炒至酥脆盛出，干辣椒剪段去籽', tips: '' }, { order: 3, desc: '碗中调汁：生抽2勺、醋2勺、白糖1勺、淀粉半勺、水2勺拌匀', tips: '' }, { order: 4, desc: '锅热倒油，放入花椒和干辣椒段小火炒出香味', tips: '' }, { order: 5, desc: '转大火倒入鸡丁快速滑炒至变白，加姜蒜葱白炒香', tips: '' }, { order: 6, desc: '倒入调好的料汁翻炒至浓稠，最后加入花生米翻匀出锅', tips: '花生米最后放才能保持酥脆' }],
    tutorials: [{ platform: 'bilibili', title: '宫保鸡丁做法', url: 'https://www.bilibili.com/video/BV12h411m7Bx/' }],
  },
  {
    name: '红烧排骨', category: '荤菜', difficulty: 'medium', estimatedMinutes: 60,
    description: '色泽红亮、软烂脱骨的经典家常菜，酱香浓郁配米饭绝了。',
    ingredients: [{ name: '猪肋排', amount: 500, unit: '克' }, { name: '冰糖', amount: 15, unit: '克' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 2, unit: '勺' }, { name: '姜片', amount: 4, unit: '片' }, { name: '葱段', amount: 2, unit: '根' }, { name: '八角', amount: 2, unit: '颗' }, { name: '桂皮', amount: 1, unit: '小块' }],
    steps: [{ order: 1, desc: '排骨冷水下锅，加姜片料酒焯水，撇去浮沫捞出洗净', tips: '' }, { order: 2, desc: '锅中少许油，放入冰糖小火炒至琥珀色起小泡', tips: '炒糖色用冰糖颜色更亮' }, { order: 3, desc: '迅速倒入排骨翻炒均匀裹上糖色', tips: '' }, { order: 4, desc: '加入姜片、葱段、八角、桂皮炒香，淋料酒、生抽、老抽翻匀', tips: '' }, { order: 5, desc: '倒入热水没过排骨，大火烧开转小火炖40分钟', tips: '一定要加热水炖煮，冷水会让排骨发柴' }, { order: 6, desc: '开盖大火收汁至浓稠，加盐调味，撒葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '红烧排骨做法', url: 'https://www.bilibili.com/video/BV1sAybY6Ea2/' }],
  },
  {
    name: '可乐鸡翅', category: '荤菜', difficulty: 'easy', estimatedMinutes: 30,
    description: '零失败新手菜，甜咸交融、色泽诱人，大人小孩都爱吃。',
    ingredients: [{ name: '鸡翅中', amount: 8, unit: '个' }, { name: '可乐', amount: 1, unit: '罐' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 0.5, unit: '勺' }, { name: '料酒', amount: 1, unit: '勺' }, { name: '姜片', amount: 3, unit: '片' }],
    steps: [{ order: 1, desc: '鸡翅两面各划两刀方便入味，冷水下锅加料酒姜片焯水捞出', tips: '' }, { order: 2, desc: '锅中少许油，放入鸡翅煎至两面金黄', tips: '' }, { order: 3, desc: '加入生抽、老抽翻炒上色', tips: '' }, { order: 4, desc: '倒入可乐没过鸡翅，大火烧开转小火炖15分钟', tips: '用普通可乐即可，不要用零度或无糖可乐' }, { order: 5, desc: '开盖转大火收汁，不停翻动防止粘锅', tips: '收汁时要不停翻动' }, { order: 6, desc: '汤汁浓稠裹满鸡翅即可出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '可乐鸡翅做法', url: 'https://www.bilibili.com/video/BV14NZ4YqEaz/' }],
  },
  {
    name: '红烧牛腩', category: '荤菜', difficulty: 'hard', estimatedMinutes: 90,
    description: '鲜香软烂的硬菜，牛腩炖至酥烂入味，汤汁拌饭能吃三碗。',
    ingredients: [{ name: '牛腩', amount: 500, unit: '克' }, { name: '土豆', amount: 1, unit: '个' }, { name: '胡萝卜', amount: 1, unit: '根' }, { name: '洋葱', amount: 0.5, unit: '个' }, { name: '姜片', amount: 4, unit: '片' }, { name: '蒜', amount: 4, unit: '瓣' }, { name: '八角', amount: 2, unit: '颗' }, { name: '桂皮', amount: 1, unit: '小块' }, { name: '干辣椒', amount: 3, unit: '个' }, { name: '豆瓣酱', amount: 1, unit: '勺' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 2, unit: '勺' }],
    steps: [{ order: 1, desc: '牛腩切块冷水下锅，加姜片料酒焯水，撇去浮沫捞出洗净', tips: '' }, { order: 2, desc: '锅中少许油，放入姜蒜、八角、桂皮、干辣椒炒香', tips: '' }, { order: 3, desc: '加入豆瓣酱小火炒出红油，倒入牛腩翻炒上色', tips: '' }, { order: 4, desc: '淋入料酒、生抽、老抽翻匀，倒入热水没过牛腩', tips: '' }, { order: 5, desc: '大火烧开转小火炖60分钟，加入土豆胡萝卜块继续炖20分钟', tips: '牛腩要选带筋的部位，炖出来才软糯；土豆不要太早放以免炖烂' }, { order: 6, desc: '大火收汁，加盐调味出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '红烧牛腩做法', url: 'https://www.bilibili.com/video/BV1UT4y1d7Bo/' }],
  },
  {
    name: '红烧茄子', category: '素菜', difficulty: 'easy', estimatedMinutes: 20,
    description: '外酥里嫩、味美多汁的下饭神菜，素菜也能吃出肉香味。',
    ingredients: [{ name: '茄子', amount: 2, unit: '根' }, { name: '蒜', amount: 4, unit: '瓣' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 0.5, unit: '勺' }, { name: '醋', amount: 1, unit: '勺' }, { name: '白糖', amount: 1, unit: '勺' }, { name: '淀粉', amount: 1, unit: '勺' }, { name: '葱花', amount: 1, unit: '适量' }],
    steps: [{ order: 1, desc: '茄子切滚刀块，撒少许盐腌10分钟挤出水分', tips: '茄子提前用盐腌出水分，可以减少吸油量' }, { order: 2, desc: '碗中调汁：生抽、老抽、醋、白糖、淀粉、适量水搅匀', tips: '' }, { order: 3, desc: '锅中多放些油，放入茄子中火煎至两面金黄盛出', tips: '煎茄子油要多一些' }, { order: 4, desc: '锅中留底油，爆香蒜末', tips: '' }, { order: 5, desc: '倒入茄子和调好的料汁，翻炒至汤汁浓稠', tips: '' }, { order: 6, desc: '撒葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '红烧茄子做法', url: 'https://www.bilibili.com/video/BV1Wg411L7WG/' }],
  },
  {
    name: '红烧鸡块', category: '荤菜', difficulty: 'medium', estimatedMinutes: 35,
    description: '鸡肉鲜嫩、香味浓郁的家常硬菜，一大盘不够吃。',
    ingredients: [{ name: '鸡腿肉', amount: 500, unit: '克' }, { name: '青椒', amount: 2, unit: '个' }, { name: '姜片', amount: 3, unit: '片' }, { name: '蒜', amount: 3, unit: '瓣' }, { name: '干辣椒', amount: 4, unit: '个' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 2, unit: '勺' }, { name: '白糖', amount: 0.5, unit: '勺' }],
    steps: [{ order: 1, desc: '鸡腿肉切块，冷水下锅加料酒姜片焯水捞出', tips: '' }, { order: 2, desc: '锅中倒油，放入鸡块中火煸炒至表面微黄', tips: '' }, { order: 3, desc: '加入姜蒜、干辣椒炒出香味', tips: '' }, { order: 4, desc: '淋入料酒、生抽、老抽、白糖翻炒上色', tips: '' }, { order: 5, desc: '加入适量热水，盖盖中小火焖15分钟', tips: '' }, { order: 6, desc: '开盖放入青椒块，大火收汁翻炒均匀出锅', tips: '用鸡腿肉比鸡胸肉更嫩；青椒最后放保持脆爽口感' }],
    tutorials: [{ platform: 'bilibili', title: '红烧鸡块做法', url: 'https://www.bilibili.com/video/BV1ab4y127X6/' }],
  },
  {
    name: '红烧猪蹄', category: '荤菜', difficulty: 'hard', estimatedMinutes: 120,
    description: '色泽红亮、软糯脱骨，满满胶原蛋白，越吃越上瘾。',
    ingredients: [{ name: '猪蹄', amount: 1, unit: '只' }, { name: '冰糖', amount: 20, unit: '克' }, { name: '生抽', amount: 3, unit: '勺' }, { name: '老抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 2, unit: '勺' }, { name: '姜片', amount: 5, unit: '片' }, { name: '葱段', amount: 3, unit: '根' }, { name: '八角', amount: 2, unit: '颗' }, { name: '桂皮', amount: 1, unit: '小块' }, { name: '香叶', amount: 2, unit: '片' }, { name: '干辣椒', amount: 3, unit: '个' }],
    steps: [{ order: 1, desc: '猪蹄剁小块，冷水下锅加姜片料酒焯水，撇去浮沫捞出洗净', tips: '猪蹄焯水要冷水下锅才能充分去腥' }, { order: 2, desc: '锅中少许油，放入冰糖小火炒至枣红色', tips: '' }, { order: 3, desc: '倒入猪蹄快速翻炒均匀裹上糖色', tips: '' }, { order: 4, desc: '加入姜片、葱段、八角、桂皮、香叶、干辣椒炒香', tips: '' }, { order: 5, desc: '淋入料酒、生抽、老抽翻匀，倒入热水没过猪蹄', tips: '' }, { order: 6, desc: '大火烧开转小火炖90分钟至软烂，大火收汁出锅', tips: '炖煮时间要足才能软糯脱骨' }],
    tutorials: [{ platform: 'bilibili', title: '红烧猪蹄做法', url: 'https://www.bilibili.com/video/BV1RF411Y73S/' }],
  },
  {
    name: '酸辣土豆丝', category: '素菜', difficulty: 'easy', estimatedMinutes: 10,
    description: '酸辣爽口、清脆下饭的经典快手菜，五块钱搞定一盘。',
    ingredients: [{ name: '土豆', amount: 2, unit: '个' }, { name: '干辣椒', amount: 4, unit: '个' }, { name: '花椒', amount: 1, unit: '小把' }, { name: '蒜', amount: 3, unit: '瓣' }, { name: '醋', amount: 2, unit: '勺' }, { name: '葱花', amount: 1, unit: '适量' }],
    steps: [{ order: 1, desc: '土豆去皮切细丝，泡入清水中洗去淀粉，沥干备用', tips: '土豆丝一定要泡水洗去淀粉才会脆' }, { order: 2, desc: '锅热倒油，放入花椒小火炸香后捞出', tips: '' }, { order: 3, desc: '放入干辣椒段和蒜片爆香', tips: '' }, { order: 4, desc: '倒入土豆丝大火快炒1分钟', tips: '大火快炒不要超过2分钟' }, { order: 5, desc: '沿锅边淋入醋，加盐调味翻炒均匀', tips: '' }, { order: 6, desc: '撒葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '酸辣土豆丝做法', url: 'https://www.bilibili.com/video/BV1Us411H7Nw/' }],
  },
  {
    name: '红烧牛肉', category: '荤菜', difficulty: 'hard', estimatedMinutes: 100,
    description: '超级下饭的炖菜，牛肉软烂入味、土豆粉糯，汤汁拌饭绝了。',
    ingredients: [{ name: '牛肩肉', amount: 500, unit: '克' }, { name: '土豆', amount: 2, unit: '个' }, { name: '胡萝卜', amount: 1, unit: '根' }, { name: '洋葱', amount: 0.5, unit: '个' }, { name: '姜', amount: 1, unit: '大块' }, { name: '干辣椒', amount: 1, unit: '小把' }, { name: '豆瓣酱', amount: 1, unit: '勺' }, { name: '生抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 1, unit: '适量' }, { name: '小苏打', amount: 0.25, unit: '小勺' }],
    steps: [{ order: 1, desc: '牛肉切块，加小苏打、盐、料酒抓匀腌制20分钟', tips: '腌制时加少许小苏打可以让牛肉更嫩' }, { order: 2, desc: '冷水下锅焯水，撇去浮沫捞出洗净', tips: '' }, { order: 3, desc: '锅中倒油，放入姜片、干辣椒、豆瓣酱小火炒出红油', tips: '' }, { order: 4, desc: '倒入牛肉翻炒上色，淋入料酒和生抽', tips: '' }, { order: 5, desc: '倒入热水没过牛肉，大火烧开转小火炖60分钟', tips: '' }, { order: 6, desc: '加入土豆胡萝卜块继续炖20分钟，大火收汁出锅', tips: '土豆选黄皮的炖出来更粉糯' }],
    tutorials: [{ platform: 'bilibili', title: '红烧牛肉做法', url: 'https://www.bilibili.com/video/BV1sD421V7Qj/' }],
  },
  {
    name: '番茄肥牛面', category: '主食', difficulty: 'easy', estimatedMinutes: 15,
    description: '下班快手晚餐，酸甜浓郁的番茄汤底配上嫩滑肥牛，一碗超满足。',
    ingredients: [{ name: '面条', amount: 150, unit: '克' }, { name: '肥牛卷', amount: 150, unit: '克' }, { name: '番茄', amount: 2, unit: '个' }, { name: '蒜', amount: 2, unit: '瓣' }, { name: '葱花', amount: 1, unit: '适量' }, { name: '生抽', amount: 1, unit: '勺' }, { name: '白糖', amount: 0.5, unit: '勺' }],
    steps: [{ order: 1, desc: '番茄顶部划十字烫水去皮，切成小块', tips: '' }, { order: 2, desc: '锅热倒油，蒜片爆香，倒入番茄块中火炒至软烂出汁', tips: '番茄要炒烂出汁汤底才浓郁' }, { order: 3, desc: '加入生抽、白糖、适量清水煮开', tips: '' }, { order: 4, desc: '另起锅煮面条至熟，捞出放入碗中', tips: '' }, { order: 5, desc: '番茄汤中放入肥牛卷烫至变色', tips: '肥牛不要煮太久，变色就捞出才嫩' }, { order: 6, desc: '将番茄肥牛连汤浇在面上，撒葱花即可', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '番茄肥牛面做法', url: 'https://www.bilibili.com/video/BV17f4y1y7uL/' }],
  },
  {
    name: '糖醋里脊', category: '荤菜', difficulty: 'medium', estimatedMinutes: 30,
    description: '外酥里嫩、酸甜可口的经典菜，大人小孩抢着吃。',
    ingredients: [{ name: '猪里脊肉', amount: 300, unit: '克' }, { name: '鸡蛋', amount: 1, unit: '个' }, { name: '淀粉', amount: 1, unit: '适量' }, { name: '番茄酱', amount: 3, unit: '勺' }, { name: '白醋', amount: 2, unit: '勺' }, { name: '白糖', amount: 2, unit: '勺' }, { name: '白芝麻', amount: 1, unit: '少许' }],
    steps: [{ order: 1, desc: '里脊肉切条，加盐、料酒腌制10分钟', tips: '' }, { order: 2, desc: '打入鸡蛋、加入淀粉搅匀成糊状，让肉条均匀裹上', tips: '' }, { order: 3, desc: '锅中多放油烧至六成热，逐条放入肉条炸至金黄捞出', tips: '' }, { order: 4, desc: '油温升至七成热，复炸一次至酥脆捞出', tips: '复炸是酥脆的关键' }, { order: 5, desc: '锅中少许油，加入番茄酱、白醋、白糖、少许水煮至冒泡', tips: '糖醋汁要提前调好比例，现调现用' }, { order: 6, desc: '倒入炸好的里脊快速翻匀裹上酱汁，撒白芝麻出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '糖醋里脊做法', url: 'https://www.bilibili.com/video/BV12h411m7Bx/' }],
  },
  {
    name: '麻婆豆腐', category: '荤菜', difficulty: 'medium', estimatedMinutes: 15,
    description: '麻辣鲜香的川菜代表，嫩滑豆腐配肉末，拌饭能吃三碗。',
    ingredients: [{ name: '嫩豆腐', amount: 1, unit: '盒' }, { name: '猪肉末', amount: 100, unit: '克' }, { name: '豆瓣酱', amount: 1, unit: '勺' }, { name: '花椒粉', amount: 1, unit: '适量' }, { name: '蒜', amount: 3, unit: '瓣' }, { name: '姜', amount: 2, unit: '片' }, { name: '生抽', amount: 1, unit: '勺' }, { name: '淀粉水', amount: 1, unit: '适量' }, { name: '葱花', amount: 1, unit: '适量' }],
    steps: [{ order: 1, desc: '嫩豆腐切小块，放入加了盐的开水中焯2分钟捞出沥干', tips: '豆腐提前用盐水焯一下不容易碎' }, { order: 2, desc: '锅中倒油，放入肉末炒至变色出油', tips: '' }, { order: 3, desc: '加入豆瓣酱、姜蒜末小火炒出红油', tips: '' }, { order: 4, desc: '加入适量清水和生抽煮开', tips: '' }, { order: 5, desc: '轻轻放入豆腐块，中小火焖煮3分钟入味', tips: '勾芡后不要大力翻炒，轻推即可' }, { order: 6, desc: '淋入淀粉水勾芡，撒花椒粉和葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '麻婆豆腐做法', url: 'https://www.bilibili.com/video/BV1Us411H7Nw/' }],
  },
  {
    name: '蒜蓉西兰花', category: '素菜', difficulty: 'easy', estimatedMinutes: 8,
    description: '清淡爽口的健康快手菜，翠绿诱人、蒜香浓郁，减脂必备。',
    ingredients: [{ name: '西兰花', amount: 1, unit: '棵' }, { name: '蒜', amount: 5, unit: '瓣' }, { name: '蚝油', amount: 1, unit: '勺' }],
    steps: [{ order: 1, desc: '西兰花掰成小朵，淡盐水浸泡10分钟洗净', tips: '' }, { order: 2, desc: '烧开水加少许盐和几滴油，放入西兰花焯水1分钟捞出沥干', tips: '焯水时加盐和油能保持西兰花翠绿' }, { order: 3, desc: '锅热倒油，放入蒜末小火炒至微黄出香味', tips: '蒜末不要炒糊' }, { order: 4, desc: '倒入西兰花大火快炒30秒', tips: '' }, { order: 5, desc: '加入蚝油和少许盐翻炒均匀', tips: '' }, { order: 6, desc: '出锅装盘', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '蒜蓉西兰花做法', url: 'https://www.bilibili.com/video/BV14NZ4YqEaz/' }],
  },
  {
    name: '红烧大排', category: '荤菜', difficulty: 'medium', estimatedMinutes: 30,
    description: '上海本帮菜经典，鲜嫩多汁、浓油赤酱，配面配饭都好吃。',
    ingredients: [{ name: '猪大排', amount: 3, unit: '块' }, { name: '鸡蛋', amount: 1, unit: '个' }, { name: '淀粉', amount: 1, unit: '适量' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '老抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 2, unit: '勺' }, { name: '白糖', amount: 1, unit: '勺' }, { name: '姜片', amount: 3, unit: '片' }, { name: '葱段', amount: 2, unit: '根' }],
    steps: [{ order: 1, desc: '大排用刀背拍松两面，加料酒、生抽、盐腌制15分钟', tips: '大排一定要用刀背拍松，肉质才嫩' }, { order: 2, desc: '打入鸡蛋、裹上淀粉', tips: '腌制时加蛋液能锁住水分' }, { order: 3, desc: '锅中多放油，放入大排煎至两面金黄盛出', tips: '' }, { order: 4, desc: '锅中留底油，爆香姜片葱段', tips: '' }, { order: 5, desc: '放入大排，加生抽、老抽、白糖、适量热水', tips: '' }, { order: 6, desc: '盖盖中小火焖10分钟，大火收汁出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '红烧大排做法', url: 'https://www.bilibili.com/video/BV19U4y1Q7Qr/' }],
  },
  {
    name: '鱼香肉丝', category: '荤菜', difficulty: 'medium', estimatedMinutes: 20,
    description: '川菜家常名菜，酸甜咸鲜兼具，没有鱼却有鱼香味，超级下饭。',
    ingredients: [{ name: '猪里脊肉', amount: 200, unit: '克' }, { name: '木耳', amount: 50, unit: '克' }, { name: '胡萝卜', amount: 1, unit: '根' }, { name: '青椒', amount: 1, unit: '个' }, { name: '泡椒', amount: 2, unit: '个' }, { name: '蒜', amount: 3, unit: '瓣' }, { name: '姜', amount: 2, unit: '片' }, { name: '葱', amount: 2, unit: '根' }, { name: '生抽', amount: 2, unit: '勺' }, { name: '醋', amount: 2, unit: '勺' }, { name: '白糖', amount: 1.5, unit: '勺' }, { name: '料酒', amount: 1, unit: '勺' }, { name: '淀粉', amount: 1, unit: '勺' }, { name: '豆瓣酱', amount: 1, unit: '勺' }],
    steps: [{ order: 1, desc: '里脊肉切丝，加料酒、生抽、淀粉抓匀腌制10分钟', tips: '肉丝腌制加淀粉更嫩滑' }, { order: 2, desc: '木耳泡发切丝，胡萝卜青椒切丝', tips: '' }, { order: 3, desc: '碗中调鱼香汁：生抽、醋、白糖、淀粉、适量水搅匀', tips: '鱼香汁的比例是关键：醋和糖要平衡' }, { order: 4, desc: '锅热倒油，放入肉丝滑炒至变色盛出', tips: '' }, { order: 5, desc: '锅中少许油，爆香泡椒、姜蒜末、豆瓣酱，倒入配菜翻炒', tips: '' }, { order: 6, desc: '倒回肉丝，淋入鱼香汁大火翻炒至浓稠，撒葱花出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '鱼香肉丝做法', url: 'https://www.bilibili.com/video/BV12h411m7Bx/' }],
  },
  {
    name: '干煸四季豆', category: '素菜', difficulty: 'medium', estimatedMinutes: 15,
    description: '干香微辣、表皮起皱的下饭菜，简单又好吃。',
    ingredients: [{ name: '四季豆', amount: 300, unit: '克' }, { name: '猪肉末', amount: 50, unit: '克' }, { name: '干辣椒', amount: 4, unit: '个' }, { name: '花椒', amount: 1, unit: '小把' }, { name: '蒜', amount: 3, unit: '瓣' }, { name: '姜', amount: 2, unit: '片' }, { name: '生抽', amount: 1, unit: '勺' }],
    steps: [{ order: 1, desc: '四季豆摘去两头和筋，掰成段', tips: '' }, { order: 2, desc: '锅中多放油，放入四季豆中火炸至表皮起皱微焦，盛出沥油', tips: '四季豆一定要炸到表皮起皱才香' }, { order: 3, desc: '锅中留少许底油，放入肉末炒至变色', tips: '' }, { order: 4, desc: '加入干辣椒、花椒、姜蒜末炒出香味', tips: '' }, { order: 5, desc: '倒入四季豆，加生抽、盐大火翻炒均匀', tips: '' }, { order: 6, desc: '出锅装盘', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '干煸四季豆做法', url: 'https://www.bilibili.com/video/BV1L4411W7jh/' }],
  },
  {
    name: '清蒸鲈鱼', category: '荤菜', difficulty: 'medium', estimatedMinutes: 20,
    description: '鲜嫩无比的清蒸鱼，原汁原味、做法简单，宴客也拿得出手。',
    ingredients: [{ name: '鲈鱼', amount: 1, unit: '条' }, { name: '葱', amount: 3, unit: '根' }, { name: '姜', amount: 1, unit: '块' }, { name: '蒸鱼豉油', amount: 2, unit: '勺' }, { name: '料酒', amount: 1, unit: '勺' }, { name: '红椒丝', amount: 1, unit: '少许' }],
    steps: [{ order: 1, desc: '鲈鱼处理干净，两面划几刀，抹上料酒和姜片腌制10分钟', tips: '' }, { order: 2, desc: '盘中放筷子架起鱼身，铺上姜片葱段', tips: '' }, { order: 3, desc: '水烧开后放入鱼，大火蒸8分钟关火虚蒸2分钟', tips: '蒸鱼时间不能太长，8分钟刚好' }, { order: 4, desc: '取出倒掉盘中蒸汁，去掉姜葱', tips: '' }, { order: 5, desc: '铺上新的葱丝和红椒丝，淋上蒸鱼豉油', tips: '' }, { order: 6, desc: '烧热油至冒烟，浇在葱丝上激出香味即可', tips: '最后泼热油是点睛之笔，葱香四溢' }],
    tutorials: [{ platform: 'bilibili', title: '清蒸鲈鱼做法', url: 'https://www.bilibili.com/video/BV1sD421V7Qj/' }],
  },
  {
    name: '回锅肉', category: '荤菜', difficulty: 'medium', estimatedMinutes: 25,
    description: '川菜之王，肥而不腻、咸鲜微辣，配蒜苗炒香得不得了。',
    ingredients: [{ name: '五花肉', amount: 300, unit: '克' }, { name: '蒜苗', amount: 3, unit: '根' }, { name: '青椒', amount: 2, unit: '个' }, { name: '豆瓣酱', amount: 1, unit: '勺' }, { name: '甜面酱', amount: 0.5, unit: '勺' }, { name: '生抽', amount: 1, unit: '勺' }, { name: '料酒', amount: 1, unit: '勺' }, { name: '姜', amount: 3, unit: '片' }, { name: '花椒', amount: 1, unit: '几粒' }, { name: '白糖', amount: 1, unit: '少许' }],
    steps: [{ order: 1, desc: '五花肉整块冷水下锅，加姜片花椒料酒煮至筷子能插入，捞出晾凉切薄片', tips: '五花肉煮好后晾凉再切，片才能切得薄' }, { order: 2, desc: '蒜苗斜切段，青椒切块', tips: '' }, { order: 3, desc: '锅不放油，放入五花肉片中小火煸炒至出油、边缘微卷', tips: '煸炒要逼出油脂才不腻' }, { order: 4, desc: '推到锅边，放入豆瓣酱小火炒出红油', tips: '' }, { order: 5, desc: '加入甜面酱、生抽、少许白糖翻炒均匀', tips: '' }, { order: 6, desc: '放入蒜苗和青椒大火快炒至断生出锅', tips: '' }],
    tutorials: [{ platform: 'bilibili', title: '回锅肉做法', url: 'https://www.bilibili.com/video/BV1Us411H7Nw/' }],
  },
];

exports.main = async (event, context) => {
  try {
    const existing = await db.collection('recipes').where({ familyId: '' }).count();
    if (existing.total > 0) {
      return { success: true, message: '默认菜谱已存在', count: existing.total };
    }

    for (let i = 0; i < DEFAULT_RECIPES.length; i += 10) {
      const batch = DEFAULT_RECIPES.slice(i, i + 10);
      await Promise.all(batch.map(recipe =>
        db.collection('recipes').add({
          data: {
            ...recipe,
            familyId: '',
            coverUrl: '',
            createdBy: 'system',
            createdAt: db.serverDate(),
            updatedAt: db.serverDate(),
          },
        })
      ));
    }

    return { success: true, count: DEFAULT_RECIPES.length };
  } catch (err) {
    console.error('initDefaultRecipes error:', err);
    return { error: err.message };
  }
};
