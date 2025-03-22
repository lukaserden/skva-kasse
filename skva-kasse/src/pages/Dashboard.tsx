// src/pages/Dashboard.tsx
import React from "react"
import Sidebar from "@/components/Sidebar"
import { Outlet } from "react-router-dom"

const Dashboard: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Dashboard