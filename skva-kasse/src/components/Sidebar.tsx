import {
  Calendar,
  Home,
  Key,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Users,
  Calculator
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "../contexts/SidebarContext"; // ⬅️ Kontext importieren

export default function Sidebar() {
  const { collapsed, toggle } = useSidebar(); // ⬅️ globaler Zustand
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { to: "/kasse", label: "Kasse", icon: Calculator },
    { to: "/admin", label: "Home", icon: Home },
    { to: "/admin/mitglieder", label: "Mitglieder", icon: Users },
    { to: "/admin/artikel", label: "Artikel", icon: Package },
    { to: "/admin/transaktionen", label: "Transaktionen", icon: ShoppingCart },
    { to: "/admin/serviceeinheiten", label: "Service", icon: Calendar },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen border-r bg-muted flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col gap-4 p-4">
        {/* Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="self-start"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin"}
              className={({ isActive }) =>
                `relative group flex items-center ${
                  collapsed ? "justify-center px-0" : "gap-3 px-3"
                } py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? "bg-accent text-accent-foreground border border-primary/40"
                    : "text-muted-foreground border border-transparent"
                }`
              }
            >
              <Icon className="h-5 w-5" />

              {!collapsed && <span>{label}</span>}

              {collapsed && (
                <span className="absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User + Menü */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${
                collapsed ? "justify-center px-0" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback>SK</AvatarFallback>
              </Avatar>
              {!collapsed && <span>Admin</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/passwort-aendern")}>
              <Key className="mr-2 h-4 w-4" />
              Passwort ändern
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}