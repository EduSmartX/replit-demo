"use client";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DayButton } from "react-day-picker";

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  captionLayout = "dropdown",
  buttonVariant: _buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar relative z-[100] rounded-2xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/30 p-5 shadow-xl backdrop-blur-sm [--cell-size:2.75rem]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatCaption: (date) => {
          return date.toLocaleString("default", { month: "long", year: "numeric" });
        },
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "long" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-5", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn("flex items-center justify-between w-full mb-3 gap-2 px-1", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 select-none p-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 text-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 select-none p-0 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 text-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center font-bold text-lg text-gray-800 tracking-tight",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-9 w-full items-center justify-center gap-2 text-lg font-bold",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-blue-400 border-gray-300 shadow-sm has-focus:ring-blue-400/30 has-focus:ring-[3px] relative rounded-lg border transition-all",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-bold text-lg text-gray-800 tracking-tight",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse mt-3",
        weekdays: cn("flex border-b border-gray-200/60 pb-3 mb-2", defaultClassNames.weekdays),
        weekday: cn(
          "text-gray-500 flex-1 select-none text-[11px] font-bold uppercase tracking-wider text-center",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1.5 gap-1", defaultClassNames.week),
        week_number_header: cn("w-[--cell-size] select-none", defaultClassNames.week_number_header),
        week_number: cn(
          "text-muted-foreground select-none text-xs font-medium",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("bg-blue-50 rounded-lg", defaultClassNames.range_middle),
        range_end: cn(
          "bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-gradient-to-br from-amber-50 to-orange-50 text-gray-900 rounded-xl font-bold border border-amber-200/50 data-[selected=true]:from-blue-500 data-[selected=true]:to-indigo-600 data-[selected=true]:text-white data-[selected=true]:border-transparent",
          defaultClassNames.today
        ),
        outside: cn("text-gray-300/60 pointer-events-none", defaultClassNames.outside),
        disabled: cn("text-gray-300 opacity-40 line-through", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
          }

          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
          }

          return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square h-auto w-full min-w-[--cell-size] items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-sm active:scale-95",
        "data-[selected-single=true]:scale-105 data-[selected-single=true]:bg-gradient-to-br data-[selected-single=true]:from-blue-500 data-[selected-single=true]:to-indigo-600 data-[selected-single=true]:font-bold data-[selected-single=true]:text-white data-[selected-single=true]:shadow-lg data-[selected-single=true]:hover:from-blue-600 data-[selected-single=true]:hover:to-indigo-700",
        "data-[range-middle=true]:bg-gradient-to-br data-[range-middle=true]:from-blue-50 data-[range-middle=true]:to-indigo-50 data-[range-middle=true]:font-semibold data-[range-middle=true]:text-blue-900",
        "data-[range-start=true]:bg-gradient-to-br data-[range-start=true]:from-blue-500 data-[range-start=true]:to-indigo-600 data-[range-start=true]:font-bold data-[range-start=true]:text-white data-[range-start=true]:shadow-lg data-[range-start=true]:hover:from-blue-600 data-[range-start=true]:hover:to-indigo-700",
        "data-[range-end=true]:bg-gradient-to-br data-[range-end=true]:from-blue-500 data-[range-end=true]:to-indigo-600 data-[range-end=true]:font-bold data-[range-end=true]:text-white data-[range-end=true]:shadow-lg data-[range-end=true]:hover:from-blue-600 data-[range-end=true]:hover:to-indigo-700",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-blue-400 group-data-[focused=true]/day:ring-offset-2",
        "disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-transparent",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
