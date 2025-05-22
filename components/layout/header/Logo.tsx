import Link from "next/link";
import { cn } from "@/lib/utils";

const appName = "SprintBoard";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      {/* <Image
          src="/logo.png" 
         alt="Logo"
          width={40}
          height={40}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"  
         
    */}

      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
        {appName[0]}
      </div>

      <span
        className={cn(
          "text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-teal-400",
          "bg-clip-text text-transparent tracking-tight group-hover:opacity-90 transition"
        )}
      >
        {appName}
      </span>
    </Link>
  );
}

export default Logo;
