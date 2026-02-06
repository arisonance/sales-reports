'use client'

import Link from 'next/link'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  editPath: (item: T) => string
  onDelete: (item: T) => void
  onReactivate?: (item: T) => void
  isInactive?: (item: T) => boolean
  emptyMessage?: string
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  keyField,
  editPath,
  onDelete,
  onReactivate,
  isInactive,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-foreground opacity-60">
        {emptyMessage}
      </div>
    )
  }

  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) {
        return (acc as Record<string, unknown>)[part]
      }
      return undefined
    }, obj as unknown as Record<string, unknown>)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted/30">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide"
              >
                {column.header}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {data.map((item) => (
            <tr key={String(item[keyField])} className="hover:bg-muted/20">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 text-sm text-foreground"
                >
                  {column.render
                    ? column.render(item)
                    : String(getNestedValue(item, String(column.key)) ?? '')}
                </td>
              ))}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={editPath(item)}
                    className="text-sonance-blue hover:text-sonance-blue/80 text-sm font-semibold uppercase tracking-wide"
                  >
                    Edit
                  </Link>
                  {onReactivate && isInactive && isInactive(item) ? (
                    <button
                      onClick={() => onReactivate(item)}
                      className="text-sonance-green hover:text-sonance-green/80 text-sm font-semibold uppercase tracking-wide"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold uppercase tracking-wide"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
