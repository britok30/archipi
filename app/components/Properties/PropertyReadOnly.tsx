"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

interface PropertyReadOnlyConfig {
  label: string;
  variant?: "default" | "badge" | "code" | "large";
  description?: string;
  copyable?: boolean;
}

interface PropertyReadOnlyProps {
  value: string | number;
  onUpdate?: (value: any) => void;
  configs: PropertyReadOnlyConfig;
  sourceElement?: any;
  internalState?: any;
  state: any;
  className?: string;
}

const PropertyReadOnly = ({
  value,
  configs,
  className = "",
}: PropertyReadOnlyProps) => {
  const renderValue = () => {
    switch (configs.variant) {
      case "badge":
        return <Badge variant="secondary">{value}</Badge>;

      case "code":
        return (
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {value}
          </code>
        );

      case "large":
        return <span className="text-lg font-semibold">{value}</span>;

      default:
        return <span className="text-sm text-muted-foreground">{value}</span>;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label className="text-xs text-muted-foreground capitalize">
          {configs.label}
        </Label>
        <div className="flex items-center gap-2">
          {renderValue()}
          {configs.copyable && (
            <button
              onClick={() => navigator.clipboard.writeText(String(value))}
              className="ml-2 text-muted-foreground hover:text-foreground"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy to clipboard</span>
            </button>
          )}
        </div>
      </div>
      {configs.description && (
        <p className="text-sm text-muted-foreground pl-32">
          {configs.description}
        </p>
      )}
    </div>
  );
};

// Enhanced version with more display options
const EnhancedPropertyReadOnly = ({
  value,
  configs,
  className = "",
  customDisplay,
}: PropertyReadOnlyProps & {
  customDisplay?: React.ReactNode,
}) => {
  const renderCustomValue = () => {
    if (customDisplay) {
      return customDisplay;
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    if (typeof value === "number") {
      return (
        <span className="font-mono text-sm">{value.toLocaleString()}</span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      );
    }

    return <div className="text-sm text-muted-foreground">{String(value)}</div>;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-[8rem_1fr] items-center gap-4">
        <Label className="text-xs text-muted-foreground capitalize">
          {configs.label}
        </Label>
        <div className="flex items-center gap-2">
          {renderCustomValue()}
          {configs.copyable && (
            <button
              onClick={() => navigator.clipboard.writeText(String(value))}
              className="ml-2 text-muted-foreground hover:text-foreground"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy to clipboard</span>
            </button>
          )}
        </div>
      </div>
      {configs.description && (
        <p className="text-sm text-muted-foreground pl-32">
          {configs.description}
        </p>
      )}
    </div>
  );
};

export { PropertyReadOnly as default, EnhancedPropertyReadOnly };
