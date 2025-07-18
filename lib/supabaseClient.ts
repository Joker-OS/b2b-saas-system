console.log('✅ Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('✅ Supabase KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 检查是否有有效的 Supabase 配置
const hasValidConfig = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20

// 创建 Supabase 客户端
export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 检查 Supabase 是否可用
export const isSupabaseAvailable = () => {
  return hasValidConfig && supabase !== null
}

// 调试信息
if (typeof window !== 'undefined') {
  console.log('Supabase 配置检查:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '未设置',
    hasValidConfig,
    isAvailable: isSupabaseAvailable()
  })
}
