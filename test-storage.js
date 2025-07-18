// 测试 storage 功能
console.log('🧪 测试 Storage 功能...\n');

// 模拟浏览器环境
global.window = {
  localStorage: {
    data: {},
    getItem: function(key) {
      console.log(`获取 ${key}:`, this.data[key] || null);
      return this.data[key] || null;
    },
    setItem: function(key, value) {
      console.log(`设置 ${key}:`, value);
      this.data[key] = value;
    }
  }
};

// 导入 storage
const { storage } = require('./lib/storage');

async function testStorage() {
  try {
    console.log('📋 测试商品分组功能...');
    
    // 测试初始化默认分组
    storage.initializeDefaultCategory();
    const categories = storage.getCategories();
    console.log('商品分组:', categories);
    
    console.log('\n📋 测试添加商品功能...');
    
    // 测试添加商品
    const testProduct = {
      name: '测试商品',
      stock: 100,
      threshold: 20,
      categoryId: categories[0]?.id || 'default'
    };
    
    console.log('添加商品:', testProduct);
    const newProduct = storage.addProduct(testProduct);
    console.log('添加成功:', newProduct);
    
    // 验证商品是否被保存
    const products = storage.getProducts();
    console.log('所有商品:', products);
    
    console.log('\n✅ Storage 功能测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testStorage(); 