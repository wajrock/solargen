import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteSelect from './SiteSelect';
import {useInstallation} from '@/hooks/useInstallation';

vi.mock('@/hooks/useInstallation', () => ({
    useInstallation: vi.fn(),
}));

const mockInstallation = {
    sites: [
        {id: '0Y6D', kwp: 94.24, panel_model: 'Trina 310W', inverters: [], avg_capacity_factor: 0.28},
        {id: 'CIDK', kwp: 384.12, panel_model: 'Trina 330W', inverters: [], avg_capacity_factor: 0.29},
    ],
};

describe('SiteSelect', () => {
    it('displays "Tous les sites" as the placeholder when value is undefined', () => {
        vi.mocked(useInstallation).mockReturnValue({installationData: mockInstallation} as never);

        render(<SiteSelect value={undefined} onChange={vi.fn()} />);

        expect(screen.getByText('Tous les sites')).toBeInTheDocument();
    });

    it('renders a select item for each site', async () => {
        vi.mocked(useInstallation).mockReturnValue({installationData: mockInstallation} as never);
        const user = userEvent.setup();

        render(<SiteSelect value={undefined} onChange={vi.fn()} />);

        await user.click(screen.getByRole('combobox'));

        expect(await screen.findByRole('option', {name: '#0Y6D'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: '#CIDK'})).toBeInTheDocument();
    });

    it('calls onChange with undefined when "Tous les sites" is selected', async () => {
        vi.mocked(useInstallation).mockReturnValue({installationData: mockInstallation} as never);
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(<SiteSelect value="0Y6D" onChange={handleChange} />);

        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByRole('option', {name: 'Tous les sites'}));

        expect(handleChange).toHaveBeenCalledWith(undefined);
    });

    it('calls onChange with the site id when a specific site is selected', async () => {
        vi.mocked(useInstallation).mockReturnValue({installationData: mockInstallation} as never);
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(<SiteSelect value={undefined} onChange={handleChange} />);

        await user.click(screen.getByRole('combobox'));
        await user.click(await screen.findByRole('option', {name: '#0Y6D'}));

        expect(handleChange).toHaveBeenCalledWith('0Y6D');
    });

    it('renders no site items when installationData is not yet loaded', async () => {
        vi.mocked(useInstallation).mockReturnValue({installationData: undefined} as never);
        const user = userEvent.setup();

        render(<SiteSelect value={undefined} onChange={vi.fn()} />);

        await user.click(screen.getByRole('combobox'));

        expect(await screen.findByRole('option', {name: 'Tous les sites'})).toBeInTheDocument();
        expect(screen.queryByRole('option', {name: '#0Y6D'})).not.toBeInTheDocument();
    });
});
