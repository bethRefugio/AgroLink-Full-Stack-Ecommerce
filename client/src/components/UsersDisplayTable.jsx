import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const UsersDisplayTable = ({ data = [], column, columns, loading = false }) => {
  // accept either `columns` or legacy `column` prop
  const cols = columns || column || []

  const table = useReactTable({
    data,
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2">
      <table className='w-full py-0 px-0 border-collapse'>
        <thead className='bg-black text-white'>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className='border whitespace-nowrap'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className='border px-2 py-1 whitespace-nowrap '>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* loading / empty state */}
      {loading ? (
        <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
      ) : (!data || data.length === 0) && (
        <div className="text-center text-sm text-gray-500 py-4">No records found.</div>
      )}
      <div className="h-4" />
    </div>
  )
}

export default UsersDisplayTable
