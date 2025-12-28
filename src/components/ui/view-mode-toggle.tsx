import { IoGridOutline, IoListOutline, IoReorderFourOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = 'cards' | 'list' | 'table';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'cards', icon: <IoGridOutline className="h-4 w-4" />, label: 'Tarjetas' },
    { mode: 'list', icon: <IoListOutline className="h-4 w-4" />, label: 'Lista' },
    { mode: 'table', icon: <IoReorderFourOutline className="h-4 w-4" />, label: 'Tabla' },
  ];

  return (
    <div className={cn("flex items-center gap-1 border rounded-lg p-1 bg-background w-full md:w-auto", className)}>
      {modes.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          variant={value === mode ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(mode)}
          className={cn(
            "gap-2 flex-1 md:flex-none justify-center", 
            value === mode ? '' : 'hover:bg-muted text-muted-foreground'
          )}
          title={label}
        >
          {icon}
          <span className="inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
