/**
 * View Mode Tabs Component
 * Reusable tabs for switching between Staff and Student views
 */

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewMode = "staff" | "student";

interface ViewModeTabsProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}

export function ViewModeTabs({ value, onValueChange }: ViewModeTabsProps) {
  const handleChange = (newValue: string) => {
    onValueChange(newValue as ViewMode);
  };

  return (
    <Tabs value={value} onValueChange={handleChange}>
      <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100">
        <TabsTrigger
          value="staff"
          className="transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          Staff
        </TabsTrigger>
        <TabsTrigger
          value="student"
          className="transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md"
        >
          Students
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
