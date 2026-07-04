import type {Site} from '@/types/installation';
import {getSitePerformance} from '@/utils/installation';
import type {ColumnDef} from '@tanstack/react-table';
import ActionMenu from './ActionMenu/ActionMenu';
import InverterTags from './InverterTags/InverterTags';
import PerformanceBadge from './PerformanceBadge/PerformanceBadge';

export function getSitesTableColumns(avgCapacityFactor: number, standardDeviation: number): ColumnDef<Site>[] {
    return [
        {
            accessorKey: 'id',
            header: 'Identifiant',
            enableSorting: false,
            cell: ({getValue}) => `#${getValue<string>()}`,
        },
        {
            accessorKey: 'kwp',
            header: 'Capacité (kWp)',
        },
        {
            accessorKey: 'panel_model',
            header: 'Modèle panneau',
            enableSorting: false,
        },
        {
            accessorKey: 'inverters',
            header: 'Onduleur(s)',
            enableSorting: false,
            cell: ({row}) => {
                return <InverterTags inverters={row.original.inverters} />;
            },
        },
        {
            accessorKey: 'avg_capacity_factor',
            header: 'Utilisation moyenne',
            cell: ({getValue}) => `${(getValue<number>() * 100).toFixed(1)}%`,
        },
        {
            id: 'performance',
            header: 'Performance',
            enableSorting: false,
            cell: ({row}) => {
                const performance = getSitePerformance(
                    row.original.avg_capacity_factor,
                    avgCapacityFactor,
                    standardDeviation,
                );
                return <PerformanceBadge text={performance.text} type={performance.type} />;
            },
        },
        {
            id: 'actions',
            enableSorting: false,
            cell: ({row}) => {
                return <ActionMenu siteId={row.original.id} />;
            },
        },
    ];
}
