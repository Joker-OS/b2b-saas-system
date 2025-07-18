"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/circular-progress"
import { storage, type Task, type Product } from "@/lib/storage"
import { AlertTriangle, CheckCircle, Clock, Package } from "lucide-react"
import { supabase, isSupabaseAvailable } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [weeklyCompletionRate, setWeeklyCompletionRate] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 检查 Supabase 是否可用
        if (!isSupabaseAvailable() || !supabase) {
          // 使用本地存储数据
          const localTasks = storage.getTasks()
          const localProducts = storage.getProducts()
          setTasks(localTasks)
          setProducts(localProducts)
          return
        }

        // 从 Supabase 获取任务
        const { data: tasksData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
    
        if (taskError) {
          console.error('获取任务失败:', taskError)
          console.log('错误详情:', {
            code: taskError.code,
            message: taskError.message,
            details: taskError.details,
            hint: taskError.hint
          })
          
          // 根据错误类型提供不同的提示
          let errorMessage = "无法从数据库获取任务数据，使用本地数据。"
          if (taskError.code === 'PGRST116') {
            errorMessage = "数据库表不存在，请先创建表结构。"
          } else if (taskError.code === '42501') {
            errorMessage = "权限不足，请检查 RLS 策略设置。"
          } else if (taskError.code === '42P01') {
            errorMessage = "表 'tasks' 不存在，请运行数据库初始化脚本。"
          }
          
          toast({
            title: "获取任务失败",
            description: errorMessage,
            variant: "destructive",
          })
          // 使用本地存储的任务数据作为备用
          const localTasks = storage.getTasks()
          setTasks(localTasks)
        } else {
          setTasks(tasksData || [])
        }
    
        // 从 Supabase 获取库存商品
        const { data: productsData, error: productError } = await supabase
          .from('inventory_items')
          .select('*')
    
        if (productError) {
          console.error('获取库存失败:', productError)
          console.log('错误详情:', {
            code: productError.code,
            message: productError.message,
            details: productError.details,
            hint: productError.hint
          })
          
          // 根据错误类型提供不同的提示
          let errorMessage = "无法从数据库获取库存数据，使用本地数据。"
          if (productError.code === 'PGRST116') {
            errorMessage = "数据库表不存在，请先创建表结构。"
          } else if (productError.code === '42501') {
            errorMessage = "权限不足，请检查 RLS 策略设置。"
          } else if (productError.code === '42P01') {
            errorMessage = "表 'inventory_items' 不存在，请运行数据库初始化脚本。"
          }
          
          toast({
            title: "获取库存失败",
            description: errorMessage,
            variant: "destructive",
          })
          // 使用本地存储的商品数据作为备用
          const localProducts = storage.getProducts()
          setProducts(localProducts)
        } else {
          setProducts(productsData || [])
        }
      } catch (error) {
        console.error('获取数据时发生错误:', error)
      }
    }
  
    fetchData()
  }, [])

  useEffect(() => {
    // 只在客户端进行计算，避免hydration错误
    if (typeof window === 'undefined') return
    
    // 计算本周任务完成率
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    weekStart.setHours(0, 0, 0, 0)

    const weeklyTasks = tasks.filter((task: Task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= weekStart
    })

    const completedWeeklyTasks = weeklyTasks.filter((task: Task) => task.status === "completed")
    const completionRate =
      weeklyTasks.length > 0 ? Math.round((completedWeeklyTasks.length / weeklyTasks.length) * 100) : 0

    setWeeklyCompletionRate(completionRate)

    // 计算库存过低商品数量
    const lowStock = products.filter((product: Product) => product.stock < product.threshold)
    setLowStockCount(lowStock.length)
  }, [tasks, products])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task: Task) => task.status === "completed").length
  const overdueTasks = tasks.filter((task: Task) => task.status === "overdue").length
  const pendingTasks = tasks.filter((task: Task) => task.status === "pending").length
  const totalProducts = products.length

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">概览</h1>
        <p className="mt-2 text-gray-600">欢迎回来，查看您的团队数据概览</p>
      </div>

      {/* 数据卡片网格 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">总任务数</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
            <p className="text-xs text-gray-500 mt-1">已完成 {completedTasks} 个</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">待处理任务</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingTasks}</div>
            <p className="text-xs text-gray-500 mt-1">需要及时处理</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">逾期任务</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-gray-500 mt-1">需要紧急处理</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">商品总数</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">库存中的商品</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">库存预警</CardTitle>
            {lowStockCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {lowStockCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">{lowStockCount > 0 ? "库存过低" : "库存充足"}</p>
          </CardContent>
        </Card>
      </div>

      {/* 详细数据卡片 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">本周任务完成率</CardTitle>
            <CardDescription className="text-gray-600">本周创建的任务完成情况统计</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <CircularProgress percentage={weeklyCompletionRate} size={160} strokeWidth={12} />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">库存状态</CardTitle>
            <CardDescription className="text-gray-600">当前库存预警情况</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {lowStockCount > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">库存过低商品</p>
                  <p className="text-xs text-gray-500">需要补货的商品数量</p>
                </div>
              </div>
              <span className={`text-3xl font-bold ${lowStockCount > 0 ? "text-red-600" : "text-green-600"}`}>
                {lowStockCount}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">商品总数</span>
                <span className="font-medium text-gray-900">{products.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">库存充足</span>
                <span className="font-medium text-green-600">{products.length - lowStockCount}</span>
              </div>
            </div>

            {lowStockCount > 0 && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">⚠️ 有 {lowStockCount} 个商品库存低于阈值，请及时补货</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
