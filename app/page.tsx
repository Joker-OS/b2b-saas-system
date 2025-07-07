"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "@/components/circular-progress"
import { storage, type Task, type Product } from "@/lib/storage"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [weeklyCompletionRate, setWeeklyCompletionRate] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)

  useEffect(() => {
    const loadedTasks = storage.getTasks()
    const loadedProducts = storage.getProducts()

    setTasks(loadedTasks)
    setProducts(loadedProducts)

    // 计算本周任务完成率
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    weekStart.setHours(0, 0, 0, 0)

    const weeklyTasks = loadedTasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= weekStart
    })

    const completedWeeklyTasks = weeklyTasks.filter((task) => task.status === "completed")
    const completionRate =
      weeklyTasks.length > 0 ? Math.round((completedWeeklyTasks.length / weeklyTasks.length) * 100) : 0

    setWeeklyCompletionRate(completionRate)

    // 计算库存过低商品数量
    const lowStock = loadedProducts.filter((product) => product.stock < product.threshold)
    setLowStockCount(lowStock.length)
  }, [])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const overdueTasks = tasks.filter((task) => task.status === "overdue").length
  const pendingTasks = tasks.filter((task) => task.status === "pending").length

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">概览</h1>
        <p className="mt-2 text-gray-600">欢迎回来，查看您的团队数据概览</p>
      </div>

      {/* 数据卡片网格 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
