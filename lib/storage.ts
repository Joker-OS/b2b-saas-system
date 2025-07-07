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
}

export const storage = new StorageManager()
