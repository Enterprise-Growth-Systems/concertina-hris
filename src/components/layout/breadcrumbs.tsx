"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/requests": "Requests",
  "/profile": "My Profile",
  "/admin": "Admin",
  "/admin/management": "Management",
  "/admin/timesheets": "Time Logs",
  "/admin/approvals": "Approvals",
  "/admin/reports": "Reports",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Hide breadcrumbs on the root dashboard page
  if (pathname === "/") return null;

  const paths = pathname.split("/").filter((path) => path);

  const unclickablePaths = ["/admin", "/admin/announcements", "/admin/wiki"];

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground transition-colors flex items-center">
        <Home className="h-4 w-4" />
      </Link>
      
      {paths.map((path, index) => {
        const href = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;
        
        let label = routeLabels[href] || path.charAt(0).toUpperCase() + path.slice(1);
        
        // If the path looks like a CUID or UUID (length > 20)
        if (path.length > 20) {
            label = "Document";
        }

        const isUnclickable = unclickablePaths.includes(href);

        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />
            {isLast || isUnclickable ? (
              <span className={`font-semibold ${isLast ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
