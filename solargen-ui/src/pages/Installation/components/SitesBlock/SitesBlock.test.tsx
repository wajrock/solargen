import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import SitesBlock from './SitesBlock';
import type {Site} from '@/types/installation';

const mockSites: Site[] = [
    {
        id: '0Y6D',
        kwp: 94.24,
        panel_model: 'Trina 310W',
        inverters: [{model: 'SolarEdge SE25K', quantity: 1}],
        avg_capacity_factor: 0.28,
    },
    {
        id: 'CIDK',
        kwp: 384.12,
        panel_model: 'Trina 330W',
        inverters: [{model: 'ABB', quantity: 4}],
        avg_capacity_factor: 0.29,
    },
    {
        id: 'J7XV',
        kwp: 539.8,
        panel_model: 'SunPower SPR-E20-435-COM',
        inverters: [{model: 'ABB', quantity: 5}],
        avg_capacity_factor: 0.26,
    },
];

function renderSitesBlock(props: Partial<React.ComponentProps<typeof SitesBlock>> = {}) {
    return render(
        <MemoryRouter>
            <SitesBlock sites={mockSites} loading={false} {...props} />
        </MemoryRouter>,
    );
}

describe('SitesBlock', () => {
    it('renders all sites when no filter is applied', () => {
        renderSitesBlock();

        expect(screen.getByText('#0Y6D')).toBeInTheDocument();
        expect(screen.getByText('#CIDK')).toBeInTheDocument();
        expect(screen.getByText('#J7XV')).toBeInTheDocument();
    });

    it('filters sites by search value matching the id', async () => {
        const user = userEvent.setup();
        renderSitesBlock();

        const searchInput = screen.getByPlaceholderText('Rechercher un site par identifiant ou modèle..');
        await user.type(searchInput, 'CIDK');

        expect(screen.getByText('#CIDK')).toBeInTheDocument();
        expect(screen.queryByText('#0Y6D')).not.toBeInTheDocument();
    });

    it('filters sites by search value matching the panel model', async () => {
        const user = userEvent.setup();
        renderSitesBlock();

        const searchInput = screen.getByPlaceholderText('Rechercher un site par identifiant ou modèle..');
        await user.type(searchInput, 'SunPower');

        expect(screen.getByText('#J7XV')).toBeInTheDocument();
        expect(screen.queryByText('#0Y6D')).not.toBeInTheDocument();
    });

    it('shows "Aucun résultats" when the search matches nothing', async () => {
        const user = userEvent.setup();
        renderSitesBlock();

        const searchInput = screen.getByPlaceholderText('Rechercher un site par identifiant ou modèle..');
        await user.type(searchInput, 'INEXISTANT');

        expect(screen.getByText('Aucun résultats')).toBeInTheDocument();
    });

    it('does not show "Aucun résultats" while loading, even with an empty filtered list', () => {
        render(
            <MemoryRouter>
                <SitesBlock sites={[]} loading={true} />
            </MemoryRouter>,
        );

        expect(screen.queryByText('Aucun résultats')).not.toBeInTheDocument();
    });

    it('filters sites by inverter type', async () => {
        const user = userEvent.setup();
        renderSitesBlock();

        await user.click(screen.getByRole('combobox', {name: /ondulateur/i}));
        await user.click(await screen.findByRole('option', {name: 'SE25K'}));

        expect(screen.getByText('#0Y6D')).toBeInTheDocument();
        expect(screen.queryByText('#CIDK')).not.toBeInTheDocument();
    });

    it('combines search and inverter filters together', async () => {
        const user = userEvent.setup();
        renderSitesBlock();

        const searchInput = screen.getByPlaceholderText('Rechercher un site par identifiant ou modèle..');
        await user.type(searchInput, 'J7XV');

        await user.click(screen.getByRole('combobox', {name: /ondulateur/i}));
        await user.click(await screen.findByRole('option', {name: 'ABB'}));

        expect(screen.getByText('#J7XV')).toBeInTheDocument();
        expect(screen.queryByText('#CIDK')).not.toBeInTheDocument();
    });

    it('extracts unique inverter types across all sites for the filter options', async () => {
        const user = userEvent.setup();
        renderSitesBlock();

        await user.click(screen.getByRole('combobox', {name: /ondulateur/i}));

        expect(await screen.findByRole('option', {name: 'SE25K'})).toBeInTheDocument();
        expect(screen.getAllByRole('option', {name: 'ABB'})).toHaveLength(1);
    });
});
