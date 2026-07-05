import {describe, it, expect} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import SitesTable from './SitesTable';
import type {Site} from '@/types/installation';
import styles from './SitesTable.module.scss';

const mockSites: Site[] = [
    {
        id: '0Y6D',
        kwp: 94.24,
        panel_model: 'Trina 310W',
        inverters: [{model: 'SolarEdge SE82.8K', quantity: 1}],
        avg_capacity_factor: 0.2807,
    },
    {
        id: 'CIDK',
        kwp: 384.12,
        panel_model: 'Trina 330W',
        inverters: [{model: 'SolarEdge SE82.8K', quantity: 4}],
        avg_capacity_factor: 0.2922,
    },
    {
        id: 'J7XV',
        kwp: 539.8,
        panel_model: 'SunPower SPR-E20-435-COM',
        inverters: [{model: 'ABB', quantity: 5}],
        avg_capacity_factor: 0.2575,
    },
];

const avgCapacityFactor = 0.28;
const standardDeviation = 0.02;

function renderTable(props: Partial<React.ComponentProps<typeof SitesTable>> = {}) {
    return render(
        <MemoryRouter>
            <SitesTable
                sites={mockSites}
                avgCapacityFactor={avgCapacityFactor}
                standardDeviation={standardDeviation}
                loading={false}
                {...props}
            />
        </MemoryRouter>,
    );
}

describe('SitesTable', () => {
    it('renders a row for each site with its formatted id', () => {
        renderTable();

        expect(screen.getByText('#0Y6D')).toBeInTheDocument();
        expect(screen.getByText('#CIDK')).toBeInTheDocument();
        expect(screen.getByText('#J7XV')).toBeInTheDocument();
    });

    it('formats the capacity factor as a percentage with one decimal', () => {
        renderTable();

        expect(screen.getByText('28.1%')).toBeInTheDocument();
        expect(screen.getByText('29.2%')).toBeInTheDocument();
        expect(screen.getByText('25.8%')).toBeInTheDocument();
    });

    it('renders 21 skeleton rows when loading is true, regardless of sites data', () => {
        const {container} = renderTable({loading: true, sites: null});

        const rows = container.querySelectorAll(`.${styles.row}`);
        expect(rows.length).toBe(21);
    });

    it('renders skeleton cells instead of real data while loading', () => {
        const {container} = renderTable({loading: true});

        expect(container.querySelector('.skeleton')).toBeInTheDocument();
        expect(screen.queryByText('#0Y6D')).not.toBeInTheDocument();
    });

    it('renders an empty table body when sites is null and not loading', () => {
        renderTable({sites: null, loading: false});

        expect(screen.queryByText('#0Y6D')).not.toBeInTheDocument();
    });

    it('sorts rows by capacity factor in descending order when the column header is clicked once', async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByText('Utilisation moyenne'));

        const rows = screen.getAllByRole('row').slice(1);
        const firstDataRow = within(rows[0]);
        expect(firstDataRow.getByText('#CIDK')).toBeInTheDocument();
    });

    it('sorts rows by capacity factor in ascending order after clicking the column header twice', async () => {
        const user = userEvent.setup();
        renderTable();

        const header = screen.getByText('Utilisation moyenne');
        await user.click(header);
        await user.click(header);

        const rows = screen.getAllByRole('row').slice(1);
        const firstDataRow = within(rows[0]);
        expect(firstDataRow.getByText('#J7XV')).toBeInTheDocument();
    });

    it('does not allow sorting on the identifiant column', () => {
        renderTable();

        const header = screen.getByText('Identifiant').closest('th');
        expect(header?.querySelector('.lucide-chevrons-up-down')).not.toBeInTheDocument();
    });

    it('allows sorting on the kwp column', () => {
        renderTable();

        const header = screen.getByText('Capacité (kWp)').closest('th');
        expect(header?.querySelector('.lucide-chevrons-up-down')).toBeInTheDocument();
    });
});
