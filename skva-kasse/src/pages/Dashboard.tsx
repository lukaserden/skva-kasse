import { Outlet } from "react-router-dom"
import { useSidebar } from "../contexts/SidebarContext"
import Sidebar from "../components/Sidebar"

const Dashboard: React.FC = () => {
  const { collapsed } = useSidebar()

  return (
    <>
      <Sidebar />
      <main
        className={`transition-all duration-300 min-h-screen p-6 ${
          collapsed ? "pl-[4.5rem]" : "pl-[17rem]" // ≈ 1rem Abstand zur Sidebar
        }`}
      >
        <Outlet />
      </main>
    </>
  )
}

export default Dashboard