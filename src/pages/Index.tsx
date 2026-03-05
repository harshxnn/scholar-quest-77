import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNav } from "@/components/TopNav";
import { SearchArea } from "@/components/SearchArea";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopNav />
          <main className="flex flex-1 items-start justify-center pt-16 sm:pt-24 px-4 bg-secondary w-full">
            <SearchArea />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
