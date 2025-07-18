import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CustomSidebar } from "@/components/custom-sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "电商管理系统",
  description: "专为小型电商团队设计的协作管理平台"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex h-screen bg-gray-50">
          <CustomSidebar />
          <main className="flex-1 ml-64 overflow-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
