"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { type Member, storage } from "@/lib/storage"
import { supabase, isSupabaseAvailable } from "@/lib/supabaseClient"
import { Plus, Users, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function MembersPage() {
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      // 检查 Supabase 是否可用
      if (!isSupabaseAvailable() || !supabase) {
        // 使用本地存储数据
        const localMembers = storage.getMembers()
        setMembers(localMembers.length > 0 ? localMembers : [
          { id: "1", name: "张三", createdAt: new Date().toISOString() },
          { id: "2", name: "李四", createdAt: new Date().toISOString() },
          { id: "3", name: "王五", createdAt: new Date().toISOString() }
        ])
        return
      }

      const { data: membersData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (memberError) {
        console.error('获取成员失败:', memberError)
        toast({
          title: "获取成员失败",
          description: "无法从数据库获取成员数据，使用本地数据。",
          variant: "destructive",
        })
        // 使用本地存储的成员数据作为备用
        const localMembers = storage.getMembers()
        if (localMembers.length === 0) {
          // 如果本地也没有数据，使用默认成员
          setMembers([
            { id: "1", name: "张三", createdAt: new Date().toISOString() },
            { id: "2", name: "李四", createdAt: new Date().toISOString() },
            { id: "3", name: "王五", createdAt: new Date().toISOString() }
          ])
        } else {
          setMembers(localMembers)
        }
      } else {
        const formattedMembers = membersData?.map(member => ({
          id: member.id.toString(),
          name: member.name,
          createdAt: member.created_at
        })) || []
        setMembers(formattedMembers)
      }
    } catch (error) {
      console.error('加载成员时发生错误:', error)
    }
  }

  const handleAddMember = async () => {
    if (newMember.name) {
      try {
        // 检查 Supabase 是否可用
        if (!isSupabaseAvailable() || !supabase) {
          // 保存到本地存储
          storage.addMember({
            name: newMember.name
          })
          toast({
            title: "成员添加成功",
            description: "新成员已保存到本地存储。",
          })
          setNewMember({ name: "" })
          setIsDialogOpen(false)
          loadMembers()
          return
        }

        const { data, error } = await supabase
          .from('members')
          .insert([{
            name: newMember.name
          }])
          .select()

        if (error) {
          console.error('添加成员失败:', error)
          toast({
            title: "添加成员失败",
            description: "无法添加成员到数据库，保存到本地存储。",
            variant: "destructive",
          })
          // 保存到本地存储作为备用
          storage.addMember({
            name: newMember.name
          })
          setNewMember({ name: "" })
          setIsDialogOpen(false)
          loadMembers()
        } else {
          toast({
            title: "成员添加成功",
            description: "新成员已成功添加。",
          })
          setNewMember({ name: "" })
          setIsDialogOpen(false)
          loadMembers()
        }
      } catch (error) {
        console.error('添加成员时发生错误:', error)
      }
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      if (!isSupabaseAvailable() || !supabase) {
        // 从本地存储删除
        storage.deleteMember(memberId)
        toast({
          title: "成员删除成功",
          description: "成员已从本地存储删除。",
        })
        loadMembers()
        return
      }

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) {
        console.error('删除成员失败:', error)
        toast({
          title: "删除成员失败",
          description: "无法删除成员，请检查网络连接或联系管理员。",
          variant: "destructive",
        })
      } else {
        toast({
          title: "成员删除成功",
          description: "成员已成功删除。",
        })
        loadMembers()
      }
    } catch (error) {
      console.error('删除成员时发生错误:', error)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">团队成员</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加成员
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>添加团队成员</DialogTitle>
              <DialogDescription>添加新的团队成员到系统中。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="请输入姓名"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMember}>添加成员</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无团队成员，点击上方按钮添加第一个成员</p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {member.name}
                  </CardTitle>
                  <ConfirmDialog
                    title="确认删除成员"
                    description={`确定要删除成员"${member.name}"吗？此操作无法撤销。`}
                    onConfirm={() => handleDeleteMember(member.id)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ConfirmDialog>
                </div>
                <CardDescription>
                  添加时间：{new Date(member.createdAt).toLocaleDateString("zh-CN")}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
