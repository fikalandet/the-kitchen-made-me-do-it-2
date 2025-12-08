interface AdminTableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
}

export function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-[#f6f2e0]">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}
