"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
        <Label className="text-sm font-medium capitalize">
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
              <CopyIcon className="h-4 w-4" />
              <span className="sr-only">Copy to clipboard</span>
            </button>
          )}
        </div>
      </div>
      {configs.description && (
        <p className="text-sm text-muted-foreground pl-[8rem]">
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
        <Label className="text-sm font-medium capitalize">
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
              <CopyIcon className="h-4 w-4" />
              <span className="sr-only">Copy to clipboard</span>
            </button>
          )}
        </div>
      </div>
      {configs.description && (
        <p className="text-sm text-muted-foreground pl-[8rem]">
          {configs.description}
        </p>
      )}
    </div>
  );
};

// Copy icon component
const CopyIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export { PropertyReadOnly as default, EnhancedPropertyReadOnly };
