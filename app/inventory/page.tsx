"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { storage, type Product, type Category } from "@/lib/storage"
import { Package, AlertTriangle, Edit, Trash2, ArrowDown, ArrowUp, Plus, FolderPlus, Move } from "lucide-react"
import { db } from "@/lib/storageProvider"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [outboundProduct, setOutboundProduct] = useState<Product | null>(null)
  const [inboundProduct, setInboundProduct] = useState<Product | null>(null)
  const [moveProduct, setMoveProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isOutboundDialogOpen, setIsOutboundDialogOpen] = useState(false)
  const [isInboundDialogOpen, setIsInboundDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [outboundQuantity, setOutboundQuantity] = useState(0)
  const [inboundQuantity, setInboundQuantity] = useState(0)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [targetCategoryId, setTargetCategoryId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 初始化默认分组
    async function init() {
      setIsLoading(true)
      try {
        await db.initializeDefaultCategory()
        await loadData()
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

  const loadData = async () => {
    try {
      setIsLoading(true)
      const loadedProducts = await db.getProducts()
      const loadedCategories = await db.getCategories()
      setProducts(loadedProducts)
      setCategories(loadedCategories)
    } catch (error) {
      console.error('加载数据失败:', error)
      toast({
        title: "加载数据失败",
        description: "获取数据时出现错误，请刷新页面重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      try {
        setIsLoading(true)
        await db.updateProduct(editingProduct.id, {
          name: editingProduct.name,
          stock: editingProduct.stock,
          threshold: editingProduct.threshold,
        })
        setEditingProduct(null)
        setIsEditDialogOpen(false)
        await loadData()
        toast({
          title: "更新成功",
          description: "商品信息已更新。",
        })
      } catch (error) {
        console.error('更新商品失败:', error)
        toast({
          title: "更新失败",
          description: "更新商品信息时出现错误，请重试。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsLoading(true)
      await db.deleteProduct(productId)
      await loadData()
      toast({
        title: "删除成功",
        description: "商品已删除。",
      })
    } catch (error) {
      console.error('删除商品失败:', error)
      toast({
        title: "删除失败",
        description: "删除商品时出现错误，请重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOutboundProduct = (product: Product) => {
    setOutboundProduct(product)
    setOutboundQuantity(0)
    setIsOutboundDialogOpen(true)
  }

  const handleInboundProduct = (product: Product) => {
    setInboundProduct(product)
    setInboundQuantity(0)
    setIsInboundDialogOpen(true)
  }

  const handleMoveProduct = (product: Product) => {
    setMoveProduct(product)
    setTargetCategoryId("")
    setIsMoveDialogOpen(true)
  }

  const handleOutboundSubmit = async () => {
    if (outboundProduct && outboundQuantity > 0) {
      const newStock = outboundProduct.stock - outboundQuantity
      if (newStock >= 0) {
        try {
          setIsLoading(true)
          await db.updateProduct(outboundProduct.id, {
            stock: newStock,
          })
          setOutboundProduct(null)
          setOutboundQuantity(0)
          setIsOutboundDialogOpen(false)
          await loadData()
          toast({
            title: "出库成功",
            description: `已出库 ${outboundQuantity} 件商品。`,
          })
        } catch (error) {
          console.error('商品出库失败:', error)
          toast({
            title: "出库失败",
            description: "商品出库时出现错误，请重试。",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      } else {
        toast({
          title: "出库失败",
          description: "出库数量不能大于库存数量。",
          variant: "destructive",
        })
      }
    }
  }

  const handleInboundSubmit = async () => {
    if (inboundProduct && inboundQuantity > 0) {
      try {
        setIsLoading(true)
        const newStock = inboundProduct.stock + inboundQuantity
        await db.updateProduct(inboundProduct.id, {
          stock: newStock,
        })
        setInboundProduct(null)
        setInboundQuantity(0)
        setIsInboundDialogOpen(false)
        await loadData()
        toast({
          title: "入库成功",
          description: `已入库 ${inboundQuantity} 件商品。`,
        })
      } catch (error) {
        console.error('商品入库失败:', error)
        toast({
          title: "入库失败",
          description: "商品入库时出现错误，请重试。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleMoveSubmit = async () => {
    if (moveProduct && targetCategoryId) {
      try {
        setIsLoading(true)
        await db.updateProduct(moveProduct.id, {
          categoryId: targetCategoryId,
        })
        setMoveProduct(null)
        setTargetCategoryId("")
        setIsMoveDialogOpen(false)
        await loadData()
        toast({
          title: "移动成功",
          description: "商品已成功移动到新分组。",
        })
      } catch (error) {
        console.error('移动商品失败:', error)
        toast({
          title: "移动失败",
          description: "移动商品时出现错误，请重试。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        setIsLoading(true)
        await db.addCategory({ name: newCategoryName.trim() })
        setNewCategoryName("")
        setIsCategoryDialogOpen(false)
        await loadData()
        toast({
          title: "添加成功",
          description: "商品分组已添加。",
        })
      } catch (error) {
        console.error('添加分组失败:', error)
        toast({
          title: "添加失败",
          description: "添加商品分组时出现错误，请重试。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsLoading(true)
      await db.deleteCategory(categoryId)
      await loadData()
      toast({
        title: "删除成功",
        description: "商品分组已删除，相关商品已移至默认分组。",
      })
    } catch (error) {
      console.error('删除分组失败:', error)
      toast({
        title: "删除失败",
        description: "删除商品分组时出现错误，请重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isLowStock = (product: Product) => {
    return product.stock < product.threshold
  }

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(product => product.categoryId === categoryId)
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "未知分组"
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">库存管理</h2>
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="mr-2 h-4 w-4" />
              添加分组
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>添加商品分组</DialogTitle>
              <DialogDescription>创建新的商品分组来组织您的产品。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">分组名称</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="请输入分组名称"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                创建分组
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">正在加载库存数据...</p>
            </CardContent>
          </Card>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">正在初始化分组...</p>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => {
            const categoryProducts = getProductsByCategory(category.id)
            return (
              <Card key={category.id} className="w-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {category.name}
                      <Badge variant="outline">{categoryProducts.length} 个商品</Badge>
                    </CardTitle>
                    {category.name !== "默认分组" && (
                      <ConfirmDialog
                        title="确认删除分组"
                        description={`确定要删除分组"${category.name}"吗？该分组下的所有商品将移动到默认分组。此操作无法撤销。`}
                        onConfirm={() => handleDeleteCategory(category.id)}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {categoryProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">该分组暂无商品</p>
                  ) : (
                    <div className="grid gap-4">
                      {categoryProducts.map((product) => (
                        <Card key={product.id} className={isLowStock(product) ? "border-red-200 bg-red-50" : ""}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
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
                                  onClick={() => handleInboundProduct(product)}
                                >
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                  入库
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOutboundProduct(product)}
                                  disabled={product.stock === 0}
                                >
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                  出库
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleMoveProduct(product)}
                                >
                                  <Move className="h-4 w-4 mr-1" />
                                  移动
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  编辑
                                </Button>
                                <ConfirmDialog
                                  title="确认删除商品"
                                  description={`确定要删除商品"${product.name}"吗？此操作无法撤销。`}
                                  onConfirm={() => handleDeleteProduct(product.id)}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    删除
                                  </Button>
                                </ConfirmDialog>
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
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* 入库对话框 */}
      <Dialog open={isInboundDialogOpen} onOpenChange={setIsInboundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>商品入库</DialogTitle>
            <DialogDescription>
              {inboundProduct && `向 "${inboundProduct.name}" 的库存中添加指定数量`}
            </DialogDescription>
          </DialogHeader>
          {inboundProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-stock-inbound">当前库存</Label>
                <Input
                  id="current-stock-inbound"
                  value={inboundProduct.stock}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inbound-quantity">入库数量</Label>
                <Input
                  id="inbound-quantity"
                  type="number"
                  min="1"
                  value={inboundQuantity}
                  onChange={(e) => setInboundQuantity(Number.parseInt(e.target.value) || 0)}
                  placeholder="请输入入库数量"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total-stock">入库后总库存</Label>
                <Input
                  id="total-stock"
                  value={inboundProduct.stock + inboundQuantity}
                  disabled
                  className="bg-gray-50 text-green-600 font-semibold"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={handleInboundSubmit}
              disabled={!inboundQuantity || inboundQuantity <= 0}
            >
              确认入库
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="current-stock-outbound">当前库存</Label>
                <Input
                  id="current-stock-outbound"
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

      {/* 移动产品对话框 */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>移动商品</DialogTitle>
            <DialogDescription>
              {moveProduct && `将 "${moveProduct.name}" 移动到其他分组`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-category">当前分组</Label>
              <Input
                id="current-category"
                value={moveProduct ? getCategoryName(moveProduct.categoryId) : ""}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-category">目标分组</Label>
              <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择目标分组" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(category => category.id !== moveProduct?.categoryId)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleMoveSubmit}
              disabled={!targetCategoryId}
            >
              确认移动
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
