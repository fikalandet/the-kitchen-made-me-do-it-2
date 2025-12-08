interface CenteredSectionLabelProps {
  label: string;
}

export function CenteredSectionLabel({ label }: CenteredSectionLabelProps) {
  return (
    <div className="px-4 py-2">
      <p className="text-center text-sm font-semibold uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}
