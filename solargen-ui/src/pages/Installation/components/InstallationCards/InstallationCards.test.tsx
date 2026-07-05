import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import InstallationCards from './InstallationCards';
import type {Installation} from '@/types/installation';

const mockInstallation: Installation = {
    name: 'Bundoora',
    latitude: -37.71828652,
    longitude: 145.0509752,
    total_capacity: 1842,
    sites: [
        {id: '0Y6D', kwp: 94.24, panel_model: 'Trina 310W', inverters: [], avg_capacity_factor: 0.2807},
        {id: 'CIDK', kwp: 384.12, panel_model: 'Trina 330W', inverters: [], avg_capacity_factor: 0.2922},
        {id: 'J7XV', kwp: 539.8, panel_model: 'SunPower SPR-E20-435-COM', inverters: [], avg_capacity_factor: 0.2575},
    ],
};

describe('InstallationCards', () => {
    it('renders skeletons when loading is true', () => {
        const {container} = render(<InstallationCards data={undefined} loading={true} />);

        expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
        expect(screen.getByText('Capacité Totale')).toBeInTheDocument();
    });

    it('renders skeletons when data is undefined even if loading is false', () => {
        const {container} = render(<InstallationCards data={undefined} loading={false} />);

        expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
    });

    it('displays the total capacity when data is loaded', () => {
        render(<InstallationCards data={mockInstallation} loading={false} />);

        expect(screen.getByText('1842.00 kWp')).toBeInTheDocument();
    });

    it('identifies the site with the highest capacity factor as the best performing site', () => {
        render(<InstallationCards data={mockInstallation} loading={false} />);

        const bestSiteCard = screen.getByText('Site le plus performant').closest('div')?.parentElement;
        expect(bestSiteCard).toHaveTextContent('#CIDK');
    });

    it('identifies the site with the lowest capacity factor as the worst performing site', () => {
        render(<InstallationCards data={mockInstallation} loading={false} />);

        const worstSiteCard = screen.getByText('Site le moins performant').closest('div')?.parentElement;
        expect(worstSiteCard).toHaveTextContent('#J7XV');
    });

    it('displays the correct capacity factor tag for the best site', () => {
        render(<InstallationCards data={mockInstallation} loading={false} />);

        expect(screen.getByText('29.2%')).toBeInTheDocument();
    });

    it('displays the correct capacity factor tag for the worst site', () => {
        render(<InstallationCards data={mockInstallation} loading={false} />);

        expect(screen.getByText('25.8%')).toBeInTheDocument();
    });
});
