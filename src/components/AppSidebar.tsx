import {
  Home,
  FileText,
  Search,
  BookOpen,
  Settings,
  HelpCircle,
  Triangle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const mainItems = [
  { icon: Home, label: "Home" },
  { icon: FileText, label: "Documents" },
  { icon: Search, label: "Search" },
  { icon: BookOpen, label: "Library" },
];

const bottomItems = [
  { icon: HelpCircle, label: "Help" },
  { icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/40 bg-secondary">
      <SidebarHeader className="items-center py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary overflow-hidden">
          <img src="/bot.png" alt="ScholarAI Bot" className="h-full w-full object-cover" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarMenu>
          {mainItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={item.label === "Home"}
                className="justify-center"
              >
                <item.icon className="h-5 w-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-1 pb-4">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton tooltip={item.label} className="justify-center">
                <item.icon className="h-5 w-5" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
