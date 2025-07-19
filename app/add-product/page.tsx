"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type Category } from "@/lib/storage"
import { Package, ArrowLeft } from "lucide-react"
import { db } from "@/lib/storageProvider"
import { useToast } from "@/hooks/use-toast"

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState({
    name: "",
    stock: 0,
    threshold: 0,
    categoryId: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('组件加载，初始化数据...')
    // 初始化默认分组
    async function init() {
      setIsLoading(true)
      try {
        await db.initializeDefaultCategory()
        await loadCategories()
      } catch (error) {
        console.error('初始化失败:', error)
        toast({
          title: "初始化失败",
          description: "加载数据时出现错误，请刷新页面重试。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const loadCategories = async () => {
    console.log('加载商品分组...')
    setIsLoading(true)
    try {
      const loadedCategories = await db.getCategories()
      console.log('加载到的分组:', loadedCategories)
      setCategories(loadedCategories)
      
      // 如果有分组且产品分组还未设置，设置为第一个分组
      if (loadedCategories.length > 0 && !product.categoryId) {
        console.log('设置默认分组:', loadedCategories[0])
        setProduct(prev => ({ ...prev, categoryId: loadedCategories[0].id }))
      } else if (loadedCategories.length === 0) {
        console.log('没有找到分组，创建默认分组')
        const defaultCategory = await db.addCategory({ name: "默认分组" })
        setCategories([defaultCategory])
        setProduct(prev => ({ ...prev, categoryId: defaultCategory.id }))
      }
    } catch (error) {
      console.error('加载分组失败:', error)
      toast({
        title: "加载分组失败",
        description: "获取商品分组时出现错误，请刷新页面重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('提交表单:', product)
    
    // 确保有默认分组
    let finalCategoryId = product.categoryId
    if (!finalCategoryId && categories.length > 0) {
      finalCategoryId = categories[0].id
      console.log('使用默认分组:', finalCategoryId)
    }
    
    if (product.name && product.stock >= 0 && product.threshold >= 0 && finalCategoryId) {
      console.log('验证通过，开始添加商品...')
      try {
        setIsLoading(true)
        const newProduct = await db.addProduct({
          name: product.name,
          stock: product.stock,
          threshold: product.threshold,
          categoryId: finalCategoryId,
        })
        console.log('商品添加成功:', newProduct)
        toast({
          title: "添加成功",
          description: "商品已成功添加到库存中。",
        })
        router.push("/inventory")
      } catch (error) {
        console.error('添加商品失败:', error)
        toast({
          title: "添加失败",
          description: "添加商品时出现错误，请重试。",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    } else {
      console.log('表单验证失败:', {
        name: product.name,
        stock: product.stock,
        threshold: product.threshold,
        categoryId: finalCategoryId
      })
      toast({
        title: "验证失败",
        description: "请填写完整的商品信息（商品名称、库存数量、库存阈值）。",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">添加商品</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            新增商品信息
          </CardTitle>
          <CardDescription>填写商品基本信息，设置库存数量和预警阈值。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">商品名称</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                placeholder="请输入商品名称"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">商品分组</Label>
              <Select 
                value={product.categoryId} 
                onValueChange={(value) => setProduct({ ...product, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择商品分组" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">库存数量</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: Number.parseInt(e.target.value) || 0 })}
                placeholder="请输入库存数量"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">库存阈值</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={product.threshold}
                onChange={(e) => setProduct({ ...product, threshold: Number.parseInt(e.target.value) || 0 })}
                placeholder="请输入库存预警阈值"
                required
              />
              <p className="text-sm text-muted-foreground">当库存数量低于此阈值时，系统将显示库存过低预警</p>
            </div>
            <Button 
              type="submit" 
              className="w-full"
            >
              <Package className="mr-2 h-4 w-4" />
              添加商品
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
