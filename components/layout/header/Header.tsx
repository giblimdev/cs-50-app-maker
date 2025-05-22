import React from "react";
import IsConnected from "./IsConected";
import HeaderNav from "./HeaderNav";
import Logo from "./Logo";
import TodoButton from "@/components/layout/TodoButton";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md py-4 px-6 text-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <HeaderNav />
        </div>
        <div className="flex items-center gap-2">
          <IsConnected />
        </div>
        <div className="flex items-center gap-2">
          <TodoButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
