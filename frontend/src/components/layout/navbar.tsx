import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { ThemeToggle } from "../ui/theme-toggle"
import { Star, User, Settings, LogOut, Store, Shield } from "lucide-react"

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  const getDashboardLink = () => {
    if (!user) return "/login"

    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "owner":
        return "/store/dashboard"
      default:
        return "/dashboard"
    }
  }

  const getRoleIcon = () => {
    if (!user) return <User className="h-4 w-4" />

    switch (user.role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "owner":
        return <Store className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold text-foreground">StoreRate</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/stores">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Browse Stores
              </Button>
            </Link>

            <ThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="flex items-center">
                      {getRoleIcon()}
                      <span className="ml-2">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "owner" && (
                    <DropdownMenuItem asChild>
                      <Link to="/store/edit" className="flex items-center">
                        <Settings className="h-4 w-4" />
                        <span className="ml-2">Store Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center">
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
