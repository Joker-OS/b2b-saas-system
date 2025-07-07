"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { storage, type Product } from "@/lib/storage"
import { Package, AlertTriangle, Edit, Trash2, ArrowDown } from "lucide-react"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [outboundProduct, setOutboundProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isOutboundDialogOpen, setIsOutboundDialogOpen] = useState(false)
  const [outboundQuantity, setOutboundQuantity] = useState(0)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    const loadedProducts = storage.getProducts()
    setProducts(loadedProducts)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = () => {
    if (editingProduct) {
      storage.updateProduct(editingProduct.id, {
        name: editingProduct.name,
        stock: editingProduct.stock,
        threshold: editingProduct.threshold,
      })
      setEditingProduct(null)
      setIsEditDialogOpen(false)
      loadProducts()
    }
  }

  const handleDeleteProduct = (productId: string) => {
    storage.deleteProduct(productId)
    loadProducts()
  }

  const handleOutboundProduct = (product: Product) => {
    setOutboundProduct(product)
    setOutboundQuantity(0)
    setIsOutboundDialogOpen(true)
  }

  const handleOutboundSubmit = () => {
    if (outboundProduct && outboundQuantity > 0) {
      const newStock = outboundProduct.stock - outboundQuantity
      if (newStock >= 0) {
        storage.updateProduct(outboundProduct.id, {
          stock: newStock,
        })
        setOutboundProduct(null)
        setOutboundQuantity(0)
        setIsOutboundDialogOpen(false)
        loadProducts()
      }
    }
  }

  const isLowStock = (product: Product) => {
    return product.stock < product.threshold
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">库存管理</h2>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无商品，前往"添加商品"页面添加第一个商品</p>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className={isLowStock(product) ? "border-red-200 bg-red-50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isLowStock(product) && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        库存过低
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOutboundProduct(product)}
                      disabled={product.stock === 0}
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      出库
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-sm text-muted-foreground">当前库存：</span>
                      <span className={`font-semibold ${isLowStock(product) ? "text-red-600" : "text-green-600"}`}>
                        {product.stock}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">库存阈值：</span>
                      <span className="font-semibold">{product.threshold}</span>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* 出库对话框 */}
      <Dialog open={isOutboundDialogOpen} onOpenChange={setIsOutboundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>商品出库</DialogTitle>
            <DialogDescription>
              {outboundProduct && `从 "${outboundProduct.name}" 的库存中出库指定数量`}
            </DialogDescription>
          </DialogHeader>
          {outboundProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-stock">当前库存</Label>
                <Input
                  id="current-stock"
                  value={outboundProduct.stock}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="outbound-quantity">出库数量</Label>
                <Input
                  id="outbound-quantity"
                  type="number"
                  min="1"
                  max={outboundProduct.stock}
                  value={outboundQuantity}
                  onChange={(e) => setOutboundQuantity(Number.parseInt(e.target.value) || 0)}
                  placeholder="请输入出库数量"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="remaining-stock">出库后剩余库存</Label>
                <Input
                  id="remaining-stock"
                  value={outboundProduct.stock - outboundQuantity}
                  disabled
                  className={`bg-gray-50 ${
                    outboundProduct.stock - outboundQuantity < outboundProduct.threshold 
                      ? "text-red-600 font-semibold" 
                      : "text-green-600 font-semibold"
                  }`}
                />
                {outboundProduct.stock - outboundQuantity < outboundProduct.threshold && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    警告：出库后库存将低于阈值
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={handleOutboundSubmit}
              disabled={!outboundQuantity || outboundQuantity <= 0 || (outboundProduct ? outboundQuantity > outboundProduct.stock : true)}
            >
              确认出库
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑商品</DialogTitle>
            <DialogDescription>修改商品信息和库存数量。</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">商品名称</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stock">库存数量</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, stock: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-threshold">库存阈值</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={editingProduct.threshold}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, threshold: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateProduct}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
