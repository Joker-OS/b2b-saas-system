// 数据存储工具类，便于后续切换为真实数据库
export interface Task {
  id: string
  title: string
  assignee: string
  dueDate: string
  status: "pending" | "completed" | "overdue"
  createdAt: string
}

export interface Product {
  id: string
  name: string
  stock: number
  threshold: number
  categoryId: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Member {
  id: string
  name: string
  createdAt: string
}

class StorageManager {
  private getItem<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : []
  }

  private setItem<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  // 任务管理
  getTasks(): Task[] {
    return this.getItem<Task>("tasks")
  }

  saveTasks(tasks: Task[]): void {
    this.setItem("tasks", tasks)
  }

  addTask(task: Omit<Task, "id" | "createdAt">): Task {
    const tasks = this.getTasks()
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    tasks.push(newTask)
    this.saveTasks(tasks)
    return newTask
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.getTasks()
    const index = tasks.findIndex((task) => task.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates }
      this.saveTasks(tasks)
    }
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter((task) => task.id !== id)
    this.saveTasks(tasks)
  }

  // 商品管理
  getProducts(): Product[] {
    return this.getItem<Product>("products")
  }

  saveProducts(products: Product[]): void {
    this.setItem("products", products)
  }

  addProduct(product: Omit<Product, "id" | "createdAt">): Product {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    products.push(newProduct)
    this.saveProducts(products)
    return newProduct
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.getProducts()
    const index = products.findIndex((product) => product.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      this.saveProducts(products)
    }
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((product) => product.id !== id)
    this.saveProducts(products)
  }

  // 分组管理
  getCategories(): Category[] {
    return this.getItem<Category>("categories")
  }

  saveCategories(categories: Category[]): void {
    this.setItem("categories", categories)
  }

  addCategory(category: Omit<Category, "id" | "createdAt">): Category {
    const categories = this.getCategories()
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    categories.push(newCategory)
    this.saveCategories(categories)
    return newCategory
  }

  updateCategory(id: string, updates: Partial<Category>): void {
    const categories = this.getCategories()
    const index = categories.findIndex((category) => category.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      this.saveCategories(categories)
    }
  }

  deleteCategory(id: string): void {
    // 删除分组时，将该分组下的产品移动到默认分组
    const categories = this.getCategories()
    const defaultCategory = categories.find(c => c.name === "默认分组")
    
    if (defaultCategory) {
      const products = this.getProducts()
      const updatedProducts = products.map(product => 
        product.categoryId === id ? { ...product, categoryId: defaultCategory.id } : product
      )
      this.saveProducts(updatedProducts)
    }

    // 删除分组
    const updatedCategories = categories.filter((category) => category.id !== id)
    this.saveCategories(updatedCategories)
  }

  // 成员管理
  getMembers(): Member[] {
    return this.getItem<Member>("members")
  }

  saveMembers(members: Member[]): void {
    this.setItem("members", members)
  }

  addMember(member: Omit<Member, "id" | "createdAt">): Member {
    const members = this.getMembers()
    const newMember: Member = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    members.push(newMember)
    this.saveMembers(members)
    return newMember
  }

  deleteMember(id: string): void {
    const members = this.getMembers().filter((member) => member.id !== id)
    this.saveMembers(members)
  }

  // 初始化默认分组
  initializeDefaultCategory(): void {
    const categories = this.getCategories()
    if (categories.length === 0) {
      this.addCategory({ name: "默认分组" })
    }
  }
}

export const storage = new StorageManager()
