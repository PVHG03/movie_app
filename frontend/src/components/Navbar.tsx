import { LogOut, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authUser";
import { useContentStore } from "../store/content";

export default function Navbar() {

  const { logout } = useAuthStore() as any;

  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setIsMobile(!isMobile);
  }

  const { setContentType } = useContentStore() as any;

  return (
    <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between p-4 h-20">
      <div className="flex items-center gap-10 z-50">
        <Link to={"/"}>
          <img src="/netflix-logo.png" alt="Netflix Logo" className="w-32 sm:w-40" />
        </Link>

        <div className="hidden sm:flex gap-2 items-center">
          <Link to={'/'} className="hover:underline text-white" onClick={() => setContentType('movie')}>Movies</Link>
          <Link to={'/'} className="hover:underline text-white" onClick={() => setContentType('tv')}>TV Shows</Link>
          <Link to={"/favorite"} className="hover:underline text-white">Favorites</Link>
        </div>
      </div>

      <div className="flex gap-2 items-center z-50">
        <Link to={"/search"} >
          <Search className="size-6 cursor-pointer"></Search>
        </Link>
        <img src="/profile.png" alt="Profile" className="h-8 rounded-full cursor-pointer"></img>
        <LogOut className="size-6 cursor-pointer" onClick={logout}></LogOut>

        <div className="sm:hidden">
          <Menu className="size-6 cursor-pointer" onClick={toggleMenu}></Menu>
        </div>
      </div>

      {isMobile && (
        <div className="w-full sm:hidden mt-4 z-50 bg-black border rounded border-gray-800">
          <Link to={"/"} className="block hover:underline p-2 hover:bg-gray-800" onClick={toggleMenu}>Movies</Link>
          <Link to={"/"} className="block hover:underline p-2 hover:bg-gray-800" onClick={toggleMenu}>TV Shows</Link>
          <Link to={"/favorite"} className="block hover:underline p-2 hover:bg-gray-800" onClick={toggleMenu}>Favorites</Link>
        </div>
      )}

    </header>
  );
}