import { Button } from '~/components/ui';
import { LucideIcon } from 'lucide-react';

interface MenuButtonProps {
  label: string;
  description: string;
  Icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function MenuButton({ label, description, Icon, onClick, className }: MenuButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''} `}
      aria-label={`${label} – ${description}`}
    >
      {/* icon column */}
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
        <Icon className="h-5 w-5" />
      </span>

      {/* text column */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </Button>
  );
}
