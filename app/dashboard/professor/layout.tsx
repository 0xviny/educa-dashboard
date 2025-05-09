"use client"

import type React from "react"

import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, ClipboardList, Laptop, LogOut, Menu, School, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  icon: React.ElementType
  title: string
  href: string
  isActive?: boolean
}

function SidebarItem({ icon: Icon, title, href, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-slate-900 hover:bg-slate-100",
        isActive ? "bg-slate-100 text-slate-900" : "text-slate-500",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </Link>
  )
}

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-16 items-center border-b px-4">
              <Link href="/dashboard/selecao" className="flex items-center gap-2 font-semibold">
                <School className="h-6 w-6" />
                <span>Educa Dashboard</span>
              </Link>
            </div>
            <nav className="grid gap-2 p-4 text-lg font-medium">
              <SidebarItem
                icon={ClipboardList}
                title="Advertências"
                href="/dashboard/professor/advertencias"
                isActive={pathname.includes("advertencias")}
              />
              <SidebarItem
                icon={Laptop}
                title="Equipamentos"
                href="/dashboard/professor/equipamentos"
                isActive={pathname.includes("equipamentos")}
              />
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/selecao" className="flex items-center gap-2 font-semibold">
            <School className="h-6 w-6" />
            <span className="hidden md:inline-block">Educa Dashboard</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", isSidebarOpen ? "rotate-180" : "")} />
          </Button>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0 md:basis-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input type="search" placeholder="Pesquisar..." className="w-full bg-white pl-8 md:w-72" />
        </div>
        <Button variant="ghost" size="icon" className="ml-auto md:ml-0">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Perfil</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Professor</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1">
        <aside className={cn("hidden w-72 flex-col border-r bg-white md:flex", isSidebarOpen ? "block" : "hidden")}>
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <SidebarItem
              icon={ClipboardList}
              title="Advertências"
              href="/dashboard/professor/advertencias"
              isActive={pathname.includes("advertencias")}
            />
            <SidebarItem
              icon={Laptop}
              title="Equipamentos"
              href="/dashboard/professor/equipamentos"
              isActive={pathname.includes("equipamentos")}
            />
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}
