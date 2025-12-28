import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function CategoryAutocomplete({
  value,
  onChange,
  categories,
  placeholder = "Seleccionar categoría...",
  disabled = false,
}: CategoryAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

  // Filter categories based on input
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!inputValue && "text-muted-foreground")}>
            {inputValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar o escribir nueva categoría..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            {filteredCategories.length === 0 && inputValue && (
              <CommandEmpty>
                <div className="py-2 px-2 text-sm">
                  <p className="text-muted-foreground">
                    No se encontraron categorías.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 justify-start"
                    onClick={() => handleSelect(inputValue)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Crear "{inputValue}"
                  </Button>
                </div>
              </CommandEmpty>
            )}
            {filteredCategories.length > 0 && (
              <CommandGroup>
                {filteredCategories.map((category) => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => handleSelect(category)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
