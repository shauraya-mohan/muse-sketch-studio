import { useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { PromptSidebar } from "@/components/PromptSidebar";
import { CanvasArea } from "@/components/CanvasArea";
import { useIsMobile } from "@/hooks/use-mobile";

export default function FashionDesignTool() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Auto-collapse sidebar on mobile
  const shouldCollapseSidebar = isMobile || isSidebarCollapsed;

  const handleGenerate = () => {
    console.log("Generate design");
    // TODO: Implement AI generation
  };

  const handleUndo = () => {
    console.log("Undo action");
    // TODO: Implement undo functionality
  };

  const handleDownload = () => {
    console.log("Download design");
    // TODO: Implement download functionality
  };

  return (
    <div className="h-screen bg-surface-primary flex flex-col font-roboto">
      {/* Top Toolbar */}
      <Toolbar
        onGenerate={handleGenerate}
        onUndo={handleUndo}
        onDownload={handleDownload}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <PromptSidebar
          isCollapsed={shouldCollapseSidebar}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        {/* Canvas Area */}
        <CanvasArea />
      </div>
    </div>
  );
}