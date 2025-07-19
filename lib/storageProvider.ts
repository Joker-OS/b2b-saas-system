// 存储提供者，用于选择使用本地存储还是 Supabase 存储
import { storage } from './storage';
import { supabaseStorage } from './supabaseStorage';
import { StorageInterface } from './storage';
import { isSupabaseAvailable } from './supabaseClient';

// 根据 Supabase 是否可用选择存储提供者
// 优先使用 Supabase 存储，如果不可用则回退到本地存储
export function getStorage(): StorageInterface {
  // 检查是否在服务器端
  if (typeof window === 'undefined') {
    return supabaseStorage; // 在服务器端总是使用 supabaseStorage
  }

  // 在客户端检查 Supabase 是否可用
  if (isSupabaseAvailable()) {
    console.log('使用 Supabase 数据库存储');
    return supabaseStorage;
  } else {
    console.log('Supabase 不可用，使用本地存储');
    return storage;
  }
}

// 导出默认存储提供者
export const db = getStorage(); 