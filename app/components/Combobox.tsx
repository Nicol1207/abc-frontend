"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

export function Combobox({
  value,
  setValue,
  options,
  placeholder,
  label,
  empty,
  className,
  style,
}: {
  value: any;
  setValue: any;
  options: any;
  placeholder: any;
  label: any;
  empty: any;
  className?: string;
  style?: any;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = options.filter((option: any) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex items-center justify-between w-full relative"
          dangerouslySetInnerHTML={{
            __html: value
              ? options.find((option: any) => option.value === value)?.label +
                '<svg style="position: absolute; right: 8px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n' +
                '  <polyline points="7 15 12 20 17 15"></polyline>\n' +
                '  <polyline points="7 9 12 4 17 9"></polyline>\n' +
                "</svg>"
              : label +
                '<svg style="position: absolute; right: 8px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n' +
                '  <polyline points="7 15 12 20 17 15"></polyline>\n' +
                '  <polyline points="7 9 12 4 17 9"></polyline>\n' +
                "</svg>",
          }}
        ></Button>
      </PopoverTrigger>
      <PopoverContent
        className={`p-0`}
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <Input
            className={"border-0 focus-visible:ring-0"}
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Separator />
          <CommandList>
            <CommandEmpty>{empty}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option: any, index: number) => (
                <CommandItem
                  key={index}
                  value={option.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  disabled={option.disabled}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: option.label }}
                  ></span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
