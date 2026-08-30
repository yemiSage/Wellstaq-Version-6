"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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
  className?: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
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
  className,
  disabled = false,
  leadingIcon,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;
    const selected = menuRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    (selected ?? menuRef.current?.querySelector<HTMLButtonElement>('[role="option"]'))?.focus();
  }, [isOpen]);

  const closeAndFocus = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={dropdownRef} className={cn("relative min-w-0", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cn(
          "flex h-10 items-center justify-between gap-2 rounded-[8px] border border-grey-4 bg-white px-4 text-sm font-medium text-grey-1 transition-colors hover:bg-grey-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 disabled:cursor-not-allowed disabled:bg-grey-5 disabled:text-grey-3",
          buttonClassName,
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          {leadingIcon && <span className="shrink-0 text-grey-3">{leadingIcon}</span>}
          <span className="truncate">{selectedOption?.label}</span>
        </span>
        <ChevronDown size={18} strokeWidth={2} aria-hidden="true" className={cn("shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="listbox"
          aria-label={ariaLabel}
          onKeyDown={(event) => {
            const options = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
            const index = options.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              closeAndFocus();
            } else if (event.key === "Tab") {
              closeAndFocus();
            } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
                : (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
              options[next]?.focus();
            }
          }}
          className={cn(
            "absolute z-50 mt-2 min-w-full max-h-60 overflow-y-auto rounded-[8px] border border-grey-4 bg-white py-1 shadow-lg",
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
                  tabIndex={-1}
                  aria-selected={option.value === value}
                  onClick={() => {
                    onValueChange(option.value);
                    closeAndFocus();
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
