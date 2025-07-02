import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { Loader } from "lucide-react";

export function DataTable({
  columns,
  nodes,
  loading,
  maxRows,
}: {columns: any, nodes: any, loading?: any, maxRows?: any}) {
  return (
    <div className="w-full overflow-auto border-t">
      <Table className={`w-full`}>
        <TableHeader>
          <TableRow>
            {columns.map((column: any, index: number) => {
              return (
                <TableHead
                  className={`text-center border-t border-b border-black border-r last:border-r-0 p-5`}
                  key={index}
                >
                  <span className="font-bold text-black text-[16px]">
                    {column.label}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                aria-colspan={columns.length}
                className={`text-center p-5`}
                colSpan={columns.length}
                key={"loading-row"}
              >
                <span className="font-bold flex justify-center items-center">
                  <Loader className="animate-spin" />
                </span>
              </TableCell>
            </TableRow>
          ) : nodes.length === 0 ? (
            <TableRow>
              <TableCell
                aria-colspan={columns.length}
                className={`text-center p-5`}
                colSpan={columns.length}
                key={"no-data-row"}
              >
                <span className="font-bold text-center">No hay datos</span>
              </TableCell>
            </TableRow>
          ) : (
            nodes.map((item: any, index: number) => {
              return (
                <TableRow key={index} className="min-h-16">
                  {columns.map((column: any, jindex: number) => {
                    return (
                      <TableCell
                        key={jindex}
                        className={`border-black border-b border-r last:border-r-0 p-5 ${column.label === "Acciones" ? "" : "text-center"}`}
                      >
                        {column.label === "Acciones" ? (
                          <div className="flex justify-center items-center gap-2">
                            {column.renderCell(item)}
                          </div>
                        ) : (
                          column.renderCell(item)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
