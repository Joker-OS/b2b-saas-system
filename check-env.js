// 检查环境变量是否正确设置
// 尝试加载 .env.local 文件
const fs = require('fs')
const path = require('path')

// 手动加载 .env.local 文件
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
}

console.log('🔍 检查环境变量...\n')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 环境变量状态:')
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`)
console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`)

if (supabaseUrl) {
  console.log(`\n🔗 URL 详情:`)
  console.log(`  完整 URL: ${supabaseUrl}`)
  console.log(`  是否以 https:// 开头: ${supabaseUrl.startsWith('https://')}`)
  console.log(`  是否包含 supabase.co: ${supabaseUrl.includes('supabase.co')}`)
  console.log(`  URL 长度: ${supabaseUrl.length}`)
}

if (supabaseAnonKey) {
  console.log(`\n🔑 Key 详情:`)
  console.log(`  是否以 eyJ 开头: ${supabaseAnonKey.startsWith('eyJ')}`)
  console.log(`  Key 长度: ${supabaseAnonKey.length}`)
  console.log(`  前20个字符: ${supabaseAnonKey.substring(0, 20)}...`)
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ 问题: 环境变量未正确设置')
  console.log('\n💡 解决方案:')
  console.log('1. 在项目根目录创建 .env.local 文件')
  console.log('2. 添加以下内容:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_匿名密钥')
  console.log('3. 重启开发服务器')
} else {
  console.log('\n✅ 环境变量设置正确')
  console.log('如果仍有问题，请检查:')
  console.log('1. Supabase 项目是否正常运行')
  console.log('2. URL 和 Key 是否正确')
  console.log('3. 是否使用了正确的密钥类型 (anon public, 不是 service_role)')
} 