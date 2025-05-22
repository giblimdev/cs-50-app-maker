"use client";

import { authClient } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserAvatarProps } from "@/utils/avatar";

interface BetterAuthClientUser {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
}

interface BetterAuthClientSession {
  data: { user: BetterAuthClientUser } | undefined;
  isPending: boolean;
}

interface MenuItem {
  label: string;
  href: string;
  condition?: (user: BetterAuthClientUser) => boolean;
  onClick?: () => void;
}

export default function UserAuthDisplay() {
  const [isClient, setIsClient] = useState(false);
  const session = authClient.useSession() as BetterAuthClientSession;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <Skeleton className="w-24 h-10 rounded-md" />;
  }

  const user = session.data?.user;
  const isLoading = session.isPending;

  if (isLoading) {
    return <Skeleton className="w-24 h-10 rounded-md" />;
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        className="text-foreground border-border hover:bg-accent hover:text-accent-foreground"
        asChild
      >
        <Link href="/auth/sign-in">Sign In</Link>
      </Button>
    );
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = "/auth/goodbye";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/auth/sign-in?error=logout_failed";
    }
  };

  // Define menu items
  const menuItems: MenuItem[] = [
    { label: "Profile", href: "/user/profile" },
    { label: "Dashboard", href: "/user/dashboard" },
    {
      label: "Admin Panel",
      href: "/admin",
      condition: (user) => user.role === "admin",
    },
    { label: "Sign Out", href: "#", onClick: handleSignOut },
  ];

  // Get avatar properties using the utility function
  const { src, fallback, bgColor } = getUserAvatarProps(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={src} alt={user.name || "User"} />
            <AvatarFallback
              style={{ backgroundColor: bgColor, color: "white" }}
            >
              {fallback}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user.email && (
          <div className="px-2 py-1.5 text-sm font-medium text-foreground/80">
            {user.email}
          </div>
        )}
        {user.email && <DropdownMenuSeparator />}
        {menuItems.map((item, index) => {
          // Skip items where condition is defined and not met
          if (item.condition && !item.condition(user)) {
            return null;
          }
          // Render separator before Sign Out
          const isLastItem = index === menuItems.length - 1;
          return (
            <div key={item.label}>
              <DropdownMenuItem asChild>
                {item.onClick ? (
                  <button onClick={item.onClick} className="w-full text-left">
                    {item.label}
                  </button>
                ) : (
                  <Link href={item.href}>{item.label}</Link>
                )}
              </DropdownMenuItem>
              {isLastItem && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownMenuSeparator() {
  return <div className="h-px bg-border my-1" />;
}
