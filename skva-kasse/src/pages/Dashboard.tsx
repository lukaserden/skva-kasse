import { Outlet } from "react-router-dom"
import { useSidebar } from "../contexts/SidebarContext"
import Sidebar from "../components/Sidebar"

const Dashboard: React.FC = () => {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main
        className={`ml-${collapsed ? "16" : "64"} transition-all duration-300 min-h-screen p-6`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default Dashboard;