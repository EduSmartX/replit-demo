"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "border-input ring-offset-background data-[placeholder]:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

// Context for search functionality
const SelectSearchContext = React.createContext<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchThreshold: number;
}>({
  searchTerm: "",
  setSearchTerm: () => {},
  searchThreshold: 10,
});

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    searchThreshold?: number;
    searchPlaceholder?: string;
  }
>(
  (
    {
      className,
      children,
      position = "popper",
      searchThreshold = 10,
      searchPlaceholder = "Search...",
      ...props
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    // Count total SelectItem children recursively
    const itemCount = React.useMemo(() => {
      let count = 0;
      const countItems = (children: React.ReactNode): void => {
        React.Children.forEach(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === SelectItem) {
              count++;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if ((child.props as any)?.children) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              countItems((child.props as any).children);
            }
          }
        });
      };
      countItems(children);
      return count;
    }, [children]);

    const shouldShowSearch = itemCount > searchThreshold;

    // Filter children based on search term
    const filteredChildren = React.useMemo(() => {
      if (!shouldShowSearch || !searchTerm) {
        return children;
      }

      const filterChildren = (children: React.ReactNode): React.ReactNode => {
        return React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) {
            return child;
          }

          // For SelectItem, check if the text content matches
          if (child.type === SelectItem) {
            const getTextContent = (node: React.ReactNode): string => {
              if (typeof node === "string") {
                return node;
              }
              if (typeof node === "number") {
                return String(node);
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (React.isValidElement(node) && (node.props as any).children) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return getTextContent((node.props as any).children);
              }
              if (Array.isArray(node)) {
                return node.map(getTextContent).join(" ");
              }
              return "";
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const childText = getTextContent((child.props as any).children);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const childValue = String((child.props as any).value || "");

            const matches =
              childText.toLowerCase().includes(searchTerm.toLowerCase()) ||
              childValue.toLowerCase().includes(searchTerm.toLowerCase());

            return matches ? child : null;
          }

          // For groups or other containers, recursively filter their children
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((child.props as any)?.children) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const filteredNestedChildren = filterChildren((child.props as any).children);
            if (React.Children.count(filteredNestedChildren) > 0) {
              return React.cloneElement(child, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(child.props as any),
                children: filteredNestedChildren,
              });
            }
            return null;
          }

          return child;
        });
      };

      return filterChildren(children);
    }, [children, searchTerm, shouldShowSearch]);

    const hasResults = React.Children.count(filteredChildren) > 0;

    return (
      <SelectSearchContext.Provider value={{ searchTerm, setSearchTerm, searchThreshold }}>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            ref={ref}
            className={cn(
              "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-hidden rounded-md border shadow-md",
              position === "popper" &&
                "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
              className
            )}
            position={position}
            {...props}
          >
            {shouldShowSearch && (
              <div className="bg-popover sticky top-0 z-10 flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                />
              </div>
            )}
            <SelectScrollUpButton />
            <div className="max-h-[300px] overflow-x-hidden overflow-y-auto">
              <SelectPrimitive.Viewport
                className={cn(
                  "p-1",
                  position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]"
                )}
              >
                {(() => {
                  if (hasResults) {
                    return filteredChildren;
                  }
                  if (shouldShowSearch && searchTerm) {
                    return (
                      <div className="text-muted-foreground py-6 text-center text-sm">
                        No results found.
                      </div>
                    );
                  }
                  return filteredChildren;
                })()}
              </SelectPrimitive.Viewport>
            </div>
            <SelectScrollDownButton />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectSearchContext.Provider>
    );
  }
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
