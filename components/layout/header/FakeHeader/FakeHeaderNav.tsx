import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function HeaderNav() {
  const nav = [
    { name: "Accueil", link: "/" },
    { name: "My_Projects", link: "/projects" },
    { name: "Promptes", link: "/prompte" },
    { name: "Liens utiles", link: "/liens" },
  ];

  return (
    <nav className="flex flex-wrap gap-2">
      {nav.map((item) => (
        <Link key={item.link} href={item.link}>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 transition-colors"
          >
            {item.name}
          </Button>
        </Link>
      ))}
    </nav>
  );
}

export default HeaderNav;
