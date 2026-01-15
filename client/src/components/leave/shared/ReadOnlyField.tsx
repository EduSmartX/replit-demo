interface ReadOnlyFieldProps {
  label: string;
  value: string | number;
  description?: string;
}

export function ReadOnlyField({ label, value, description }: ReadOnlyFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <div className="rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
        {value || "Not provided"}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
