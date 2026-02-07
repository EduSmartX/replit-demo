import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ResizableSidebarProps {
  children: (width: number) => ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  className?: string;
  isOpen: boolean;
}

export function ResizableSidebar({
  children,
  minWidth = 280,
  maxWidth = 500,
  defaultWidth = 256, // 64 in tailwind = 256px
  className,
  isOpen,
}: ResizableSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && sidebarRef.current) {
      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed left-0 z-20 flex flex-col border-r transition-transform duration-300 md:z-0 md:translate-x-0",
          "top-0 h-screen md:top-16 md:h-[calc(100vh-4rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        style={{
          width: `${sidebarWidth}px`,
        }}
      >
        {children(sidebarWidth)}

        {/* Resize Handle */}
        <div
          className="group absolute top-0 right-0 hidden h-full w-1 cursor-ew-resize transition-all hover:w-1.5 hover:bg-blue-400 md:block"
          onMouseDown={startResizing}
          role="button"
          tabIndex={0}
          aria-label="Resize sidebar"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
            }
          }}
        >
          <div className="absolute top-1/2 right-0 flex h-12 w-3 translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-blue-500 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            <div className="flex flex-col gap-0.5">
              <div className="h-1 w-0.5 rounded-full bg-white"></div>
              <div className="h-1 w-0.5 rounded-full bg-white"></div>
              <div className="h-1 w-0.5 rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for main content */}
      <div
        className={cn("flex-shrink-0", "hidden md:block")}
        style={{ width: `${sidebarWidth}px` }}
      />
    </>
  );
}
