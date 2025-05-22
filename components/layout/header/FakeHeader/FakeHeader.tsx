import React from "react";
import IsConnected from "@/components/layout/header/FakeHeader/FakeIsConnected";
import HeaderNav from "@/components/layout/header/FakeHeader/FakeHeaderNav";
import Logo from "@/components/layout/header/FakeHeader/FakeLogo";
import TodoButton from "@/components/layout/TodoButton";

function Header() {
  return (
    <header className=" w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md py-4 px-6 text-white">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo />
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
