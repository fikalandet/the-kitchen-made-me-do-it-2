interface PackagePriceSubrowProps {
  packageLabel: string;
}

export function PackagePriceSubrow({ packageLabel }: PackagePriceSubrowProps) {
  return (
    <div className="px-4 pb-2">
      <p className="text-xs text-gray-500 text-right">{packageLabel}</p>
    </div>
  );
}
