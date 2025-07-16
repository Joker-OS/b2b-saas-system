"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { type Task, type Member } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { Plus, Calendar, User, CheckCircle, Clock, AlertTriangle, Trash2 } from "lucide-react"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 从 Supabase 获取任务
      const { data: tasksData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (taskError) {
        console.error('获取任务失败:', taskError)
      } else {
        // 转换数据格式以匹配本地类型
        const formattedTasks = tasksData?.map(task => ({
          id: task.id.toString(),
          title: task.title,
          assignee: task.assignee,
          dueDate: task.due_date,
          status: task.status as "pending" | "completed" | "overdue",
          createdAt: task.created_at
        })) || []

        // 更新逾期任务状态
        const updatedTasks = formattedTasks.map((task) => {
          if (task.status === "pending" && new Date(task.dueDate) < new Date()) {
            handleUpdateTaskStatus(task.id, "overdue")
            return { ...task, status: "overdue" as const }
          }
          return task
        })

        setTasks(updatedTasks)
      }

      // 从 Supabase 获取成员
      const { data: membersData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (memberError) {
        console.error('获取成员失败:', memberError)
        // 如果成员表不存在，使用默认成员
        setMembers([
          { id: "1", name: "张三", createdAt: new Date().toISOString() },
          { id: "2", name: "李四", createdAt: new Date().toISOString() },
          { id: "3", name: "王五", createdAt: new Date().toISOString() }
        ])
      } else {
        const formattedMembers = membersData?.map(member => ({
          id: member.id.toString(),
          name: member.name,
          createdAt: member.created_at
        })) || []
        setMembers(formattedMembers)
      }
    } catch (error) {
      console.error('加载数据时发生错误:', error)
    }
  }

  const handleCreateTask = async () => {
    if (newTask.title && newTask.assignee && newTask.dueDate) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            title: newTask.title,
            assignee: newTask.assignee,
            due_date: newTask.dueDate,
            status: 'pending'
          }])
          .select()

        if (error) {
          console.error('创建任务失败:', error)
        } else {
          setNewTask({ title: "", assignee: "", dueDate: "" })
          setIsDialogOpen(false)
          loadData()
        }
      } catch (error) {
        console.error('创建任务时发生错误:', error)
      }
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)

      if (error) {
        console.error('更新任务状态失败:', error)
      }
    } catch (error) {
      console.error('更新任务状态时发生错误:', error)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    await handleUpdateTaskStatus(taskId, 'completed')
    loadData()
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('删除任务失败:', error)
      } else {
        loadData()
      }
    } catch (error) {
      console.error('删除任务时发生错误:', error)
    }
  }

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            已完成
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            已逾期
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            待完成
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">任务管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建任务
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>创建新任务</DialogTitle>
              <DialogDescription>填写任务详情，指定负责人和截止时间。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">任务内容</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="请输入任务内容"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">负责人</Label>
                <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">截止时间</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTask}>创建任务</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无任务，点击上方按钮创建第一个任务</p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    {getStatusBadge(task.status)}
                  </div>
                  <ConfirmDialog
                    title="确认删除任务"
                    description={`确定要删除任务"${task.title}"吗？此操作无法撤销。`}
                    onConfirm={() => handleDeleteTask(task.id)}
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
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {task.assignee}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    截止：{formatDate(task.dueDate)}
                  </span>
                </CardDescription>
              </CardHeader>
              {task.status === "pending" && (
                <CardContent>
                  <Button onClick={() => handleCompleteTask(task.id)} className="w-full sm:w-auto">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    标记完成
                  </Button>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
