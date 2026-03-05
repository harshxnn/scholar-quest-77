import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopNav() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <span className="text-lg font-semibold text-foreground">ScholarAI</span>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          Workspace
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            S
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
