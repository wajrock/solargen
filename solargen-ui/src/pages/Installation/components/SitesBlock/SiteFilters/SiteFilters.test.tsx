import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteFilters from './SiteFilters';
import {PERFORMANCE_LEVEL} from '@/types/installation';

const defaultProps = {
    invertersType: ['SE25K', 'SE15K', 'ABB'],
    search: '',
    onSearchChange: vi.fn(),
    inverterFilter: 'all',
    onInverterFilterChange: vi.fn(),
    performanceFilter: 'all',
    onPerformanceFilterChange: vi.fn(),
};

describe('SiteFilters', () => {
    it('does not show the clear icon when search is empty', () => {
        render(<SiteFilters {...defaultProps} />);

        expect(document.querySelector('.lucide-circle-x')).not.toBeInTheDocument();
    });

    it('shows the clear icon when search has a value', () => {
        render(<SiteFilters {...defaultProps} search="0Y6D" />);

        expect(document.querySelector('.lucide-circle-x')).toBeInTheDocument();
    });

    it('calls onSearchChange with an empty string when the clear icon is clicked', async () => {
        const handleSearchChange = vi.fn();
        const user = userEvent.setup();

        render(<SiteFilters {...defaultProps} search="0Y6D" onSearchChange={handleSearchChange} />);

        await user.click(document.querySelector('.lucide-circle-x')!);

        expect(handleSearchChange).toHaveBeenCalledWith('');
    });

    it('calls onSearchChange with the typed value when the input changes', async () => {
        const handleSearchChange = vi.fn();
        const user = userEvent.setup();

        render(<SiteFilters {...defaultProps} onSearchChange={handleSearchChange} />);

        const input = screen.getByPlaceholderText('Rechercher un site par identifiant ou modèle..');
        await user.type(input, 'C');

        expect(handleSearchChange).toHaveBeenCalledWith('C');
    });

    it('renders an option for each inverter type provided', async () => {
        const user = userEvent.setup();

        render(<SiteFilters {...defaultProps} />);

        await user.click(screen.getByRole('combobox', {name: /ondulateur/i}));

        expect(await screen.findByRole('option', {name: 'SE25K'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: 'SE15K'})).toBeInTheDocument();
        expect(screen.getByRole('option', {name: 'ABB'})).toBeInTheDocument();
    });

    it('calls onInverterFilterChange when a specific inverter is selected', async () => {
        const handleInverterChange = vi.fn();
        const user = userEvent.setup();

        render(<SiteFilters {...defaultProps} onInverterFilterChange={handleInverterChange} />);

        await user.click(screen.getByRole('combobox', {name: /ondulateur/i}));
        await user.click(await screen.findByRole('option', {name: 'SE25K'}));

        expect(handleInverterChange).toHaveBeenCalledWith('SE25K');
    });

    it('calls onPerformanceFilterChange when a specific performance level is selected', async () => {
        const handlePerformanceChange = vi.fn();
        const user = userEvent.setup();

        render(<SiteFilters {...defaultProps} onPerformanceFilterChange={handlePerformanceChange} />);

        await user.click(screen.getByRole('combobox', {name: /performance/i}));
        await user.click(await screen.findByRole('option', {name: 'Excellent'}));

        expect(handlePerformanceChange).toHaveBeenCalledWith(PERFORMANCE_LEVEL.HIGH);
    });
});
