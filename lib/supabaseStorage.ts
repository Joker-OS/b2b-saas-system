// Supabase 数据存储工具类，替代本地存储
import { supabase, isSupabaseAvailable } from "@/lib/supabaseClient"
import { Product, Category, Task, Member, StorageInterface } from "@/lib/storage"

class SupabaseStorageManager implements StorageInterface {
  // 任务管理
  async getTasks(): Promise<Task[]> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        console.error('Supabase 不可用')
        return []
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取任务失败:', error)
        return []
      }

      // 转换数据格式以匹配本地类型
      return data?.map(task => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description || "",
        assignee: task.assignee,
        dueDate: task.due_date,
        status: task.status as "pending" | "completed" | "overdue",
        createdAt: task.created_at
      })) || []
    } catch (error) {
      console.error('获取任务时发生错误:', error)
      return []
    }
  }

  async addTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: task.title,
          description: task.description,
          assignee: task.assignee,
          due_date: task.dueDate,
          status: task.status
        }])
        .select()

      if (error) {
        console.error('添加任务失败:', error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('添加任务失败: 未返回数据')
      }

      // 转换返回的数据格式
      return {
        id: data[0].id.toString(),
        title: data[0].title,
        description: data[0].description || "",
        assignee: data[0].assignee,
        dueDate: data[0].due_date,
        status: data[0].status as "pending" | "completed" | "overdue",
        createdAt: data[0].created_at
      }
    } catch (error) {
      console.error('添加任务时发生错误:', error)
      throw error
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const updateData: any = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.assignee !== undefined) updateData.assignee = updates.assignee
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
      if (updates.status !== undefined) updateData.status = updates.status

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('更新任务失败:', error)
        throw error
      }
    } catch (error) {
      console.error('更新任务时发生错误:', error)
      throw error
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('删除任务失败:', error)
        throw error
      }
    } catch (error) {
      console.error('删除任务时发生错误:', error)
      throw error
    }
  }

  // 商品管理
  async getProducts(): Promise<Product[]> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        console.error('Supabase 不可用')
        return []
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取商品失败:', error)
        return []
      }

      // 转换数据格式以匹配本地类型
      return data?.map(item => ({
        id: item.id.toString(),
        name: item.name,
        stock: item.stock,
        threshold: item.threshold,
        categoryId: item.category_id,
        createdAt: item.created_at
      })) || []
    } catch (error) {
      console.error('获取商品时发生错误:', error)
      return []
    }
  }

  async addProduct(product: Omit<Product, "id" | "createdAt">): Promise<Product> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          name: product.name,
          stock: product.stock,
          threshold: product.threshold,
          category_id: product.categoryId
        }])
        .select()

      if (error) {
        console.error('添加商品失败:', error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('添加商品失败: 未返回数据')
      }

      // 转换返回的数据格式
      return {
        id: data[0].id.toString(),
        name: data[0].name,
        stock: data[0].stock,
        threshold: data[0].threshold,
        categoryId: data[0].category_id,
        createdAt: data[0].created_at
      }
    } catch (error) {
      console.error('添加商品时发生错误:', error)
      throw error
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.stock !== undefined) updateData.stock = updates.stock
      if (updates.threshold !== undefined) updateData.threshold = updates.threshold
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId

      const { error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('更新商品失败:', error)
        throw error
      }
    } catch (error) {
      console.error('更新商品时发生错误:', error)
      throw error
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('删除商品失败:', error)
        throw error
      }
    } catch (error) {
      console.error('删除商品时发生错误:', error)
      throw error
    }
  }

  // 分组管理
  async getCategories(): Promise<Category[]> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        console.error('Supabase 不可用')
        return []
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // 如果是表不存在的错误，尝试创建表
        if (error.code === '42P01') {
          await this.createCategoriesTable()
          return []
        }
        console.error('获取分组失败:', error)
        return []
      }

      // 转换数据格式以匹配本地类型
      return data?.map(category => ({
        id: category.id.toString(),
        name: category.name,
        createdAt: category.created_at
      })) || []
    } catch (error) {
      console.error('获取分组时发生错误:', error)
      return []
    }
  }

  async addCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      // 检查表是否存在，不存在则创建
      await this.createCategoriesTable()

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name
        }])
        .select()

      if (error) {
        console.error('添加分组失败:', error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('添加分组失败: 未返回数据')
      }

      // 转换返回的数据格式
      return {
        id: data[0].id.toString(),
        name: data[0].name,
        createdAt: data[0].created_at
      }
    } catch (error) {
      console.error('添加分组时发生错误:', error)
      throw error
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const updateData: any = {}
      if (updates.name !== undefined) updateData.name = updates.name

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('更新分组失败:', error)
        throw error
      }
    } catch (error) {
      console.error('更新分组时发生错误:', error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      // 获取默认分组
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('name', '默认分组')
        .limit(1)

      const defaultCategory = categories && categories.length > 0 ? categories[0] : null

      if (defaultCategory) {
        // 更新该分组下的所有商品到默认分组
        await supabase
          .from('inventory_items')
          .update({ category_id: defaultCategory.id.toString() })
          .eq('category_id', id)
      }

      // 删除分组
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('删除分组失败:', error)
        throw error
      }
    } catch (error) {
      console.error('删除分组时发生错误:', error)
      throw error
    }
  }

  // 成员管理
  async getMembers(): Promise<Member[]> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        console.error('Supabase 不可用')
        return []
      }

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取成员失败:', error)
        return []
      }

      // 转换数据格式以匹配本地类型
      return data?.map(member => ({
        id: member.id.toString(),
        name: member.name,
        createdAt: member.created_at
      })) || []
    } catch (error) {
      console.error('获取成员时发生错误:', error)
      return []
    }
  }

  async addMember(member: Omit<Member, "id" | "createdAt">): Promise<Member> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const { data, error } = await supabase
        .from('members')
        .insert([{
          name: member.name
        }])
        .select()

      if (error) {
        console.error('添加成员失败:', error)
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('添加成员失败: 未返回数据')
      }

      // 转换返回的数据格式
      return {
        id: data[0].id.toString(),
        name: data[0].name,
        createdAt: data[0].created_at
      }
    } catch (error) {
      console.error('添加成员时发生错误:', error)
      throw error
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        throw new Error('Supabase 不可用')
      }

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', parseInt(id, 10))

      if (error) {
        console.error('删除成员失败:', error)
        throw error
      }
    } catch (error) {
      console.error('删除成员时发生错误:', error)
      throw error
    }
  }

  // 初始化默认分组
  async initializeDefaultCategory(): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        console.error('Supabase 不可用')
        return
      }

      // 确保表存在
      await this.createCategoriesTable()

      // 检查是否已有默认分组
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('name', '默认分组')
        .limit(1)

      if (error) {
        console.error('检查默认分组失败:', error)
        return
      }

      // 如果没有默认分组，创建一个
      if (!data || data.length === 0) {
        await this.addCategory({ name: '默认分组' })
      }
    } catch (error) {
      console.error('初始化默认分组时发生错误:', error)
    }
  }

  // 辅助方法：创建分组表
  private async createCategoriesTable(): Promise<void> {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        return
      }

      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS categories (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS "Allow anonymous access" ON categories;
          CREATE POLICY "Allow anonymous access" ON categories FOR ALL USING (true);
        `
      })
    } catch (error) {
      console.error('创建分组表失败:', error)
    }
  }
}

export const supabaseStorage = new SupabaseStorageManager() 