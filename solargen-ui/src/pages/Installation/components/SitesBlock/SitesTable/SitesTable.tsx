import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import type {Site} from '@/types/installation';
import {flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable} from '@tanstack/react-table';
import {ChevronDown, ChevronsUpDown, ChevronUp} from 'lucide-react';
import {useMemo, useState} from 'react';
import styles from './SitesTable.module.scss';
import {getSitesTableColumns} from './tableColumns';

interface SitesTableProps {
    sites: Site[] | undefined | null;
    avgCapacityFactor: number;
    standardDeviation: number;
    loading: boolean;
}

function SitesTable({sites, avgCapacityFactor, standardDeviation, loading}: SitesTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo(
        () => getSitesTableColumns(avgCapacityFactor, standardDeviation),
        [avgCapacityFactor, standardDeviation],
    );

    const table = useReactTable({
        data: sites ?? [],
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
    return (
        <Table className={styles.table}>
            <TableHeader className={styles.tableHeader}>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className={styles.th}
                            >
                                <div className={styles.thContent}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() && (
                                        <>
                                            {{asc: <ChevronUp />, desc: <ChevronDown />}[
                                                header.column.getIsSorted() as string
                                            ] ?? <ChevronsUpDown />}
                                        </>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {loading
                    ? Array.from({length: 21}).map((_, i) => (
                          <TableRow key={i} className={styles.row}>
                              {columns.map((_, j) => (
                                  <TableCell key={j}>
                                      <div className={`${styles.skeletonCell} skeleton`} />
                                  </TableCell>
                              ))}
                          </TableRow>
                      ))
                    : table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} className={styles.row}>
                              {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id}>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </TableCell>
                              ))}
                          </TableRow>
                      ))}
            </TableBody>
        </Table>
    );
}

export default SitesTable;
