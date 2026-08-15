"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";

export interface FilterDropdownOption<T extends string> {
  label: string;
  value: T;
  group?: string;
}

interface FilterDropdownProps<T extends string> {
  value: T;
  options: FilterDropdownOption<T>[];
  onValueChange: (value: T) => void;
  ariaLabel: string;
  id?: string;
  align?: "left" | "right";
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
}

export function FilterDropdown<T extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
  id,
  align = "left",
  buttonClassName,
  menuClassName,
  disabled = false,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div ref={dropdownRef} className="relative">
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex h-10 items-center justify-between gap-2 rounded-lg border border-grey-4 bg-white px-4 text-sm font-medium text-grey-1 transition-colors hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 disabled:cursor-not-allowed disabled:bg-grey-5 disabled:text-grey-3",
          buttonClassName,
        )}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute z-50 mt-2 min-w-full overflow-hidden rounded-[4px] bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {options.map((option, index) => {
            const showGroup = option.group && option.group !== options[index - 1]?.group;
            return (
              <div key={option.value}>
                {showGroup && (
                  <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-grey-3">
                    {option.group}
                  </p>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "mx-1 flex w-[calc(100%-8px)] items-center rounded-[2px] px-3 py-2 text-left text-sm text-grey-1 transition-colors hover:bg-grey-5 focus-visible:bg-grey-5 focus-visible:outline-none",
                    option.value === value && "bg-grey-5 font-medium",
                  )}
                >
                  {option.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
