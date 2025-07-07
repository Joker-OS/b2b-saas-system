"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storage } from "@/lib/storage"
import { Package, ArrowLeft } from "lucide-react"

export default function AddProductPage() {
  const router = useRouter()
  const [product, setProduct] = useState({
    name: "",
    stock: 0,
    threshold: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product.name && product.stock >= 0 && product.threshold >= 0) {
      storage.addProduct({
        name: product.name,
        stock: product.stock,
        threshold: product.threshold,
      })
      router.push("/inventory")
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
            <Button type="submit" className="w-full">
              <Package className="mr-2 h-4 w-4" />
              添加商品
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
