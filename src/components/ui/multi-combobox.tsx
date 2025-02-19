"use client"

import * as React from "react"
import { X, Check } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"

interface Option {
  label: string
  value: string
}

interface MultiComboboxProps {
  options: Option[]
  selected: Option[]
  onChange: (options: Option[]) => void
  placeholder?: string
}

export function MultiCombobox({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
}: MultiComboboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (option: Option) => {
    onChange(selected.filter((s) => s.value !== option.value))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selected.length > 0) {
          onChange(selected.slice(0, -1))
        }
      }
      if (e.key === "Escape") {
        input.blur()
      }
    }
  }

  const selectables = options.filter((option) => !selected.includes(option))

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-[#2D2D3B] px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="bg-[#2D2D3B] text-white hover:bg-[#3D3D4B]"
            >
              {option.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselect(option)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(option)}
              >
                <X className="h-3 w-3 text-gray-400 hover:text-white" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-gray-500"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border border-[#2D2D3B] bg-[#1C1C28] shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {selectables.map((option) => {
                const isSelected = selected.includes(option)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      setInputValue("")
                      onChange(isSelected ? selected.filter((s) => s.value !== option.value) : [...selected, option])
                    }}
                    className="flex items-center gap-2 text-white hover:bg-[#2D2D3B]"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border border-[#2D2D3B] ${isSelected ? "bg-primary" : "opacity-50"}`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
