import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Settings from './index';
import useTheme, {THEME} from '@/pages/Settings/hooks/useTheme';
import useVariables from '@/hooks/useVariables';

vi.mock('@/pages/Settings/hooks/useTheme');
vi.mock('@/hooks/useVariables');

vi.mock('react-router-dom', () => ({
    Link: ({children, to, target}: {children: React.ReactNode; to: string; target?: string}) => (
        <a href={to} target={target} data-testid="mock-link">
            {children}
        </a>
    ),
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({children, onValueChange}: {children: React.ReactNode; onValueChange: (val: string) => void}) => (
        <div data-testid="mock-tabs">
            <button data-testid="trigger-light" onClick={() => onValueChange('light')}>
                Light
            </button>
            <button data-testid="trigger-dark" onClick={() => onValueChange('dark')}>
                Dark
            </button>
            <div style={{display: 'none'}}>{children}</div>
        </div>
    ),
    TabsList: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    TabsTrigger: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
    Sun: () => <svg data-testid="icon-sun" />,
    Moon: () => <svg data-testid="icon-moon" />,
    Check: () => <svg data-testid="icon-check" />,
}));

describe('Settings', () => {
    const mockSetTheme = vi.fn();
    const mockSetCo2Rate = vi.fn();
    const mockSetElectricRate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useTheme).mockReturnValue({
            theme: THEME.LIGHT,
            setTheme: mockSetTheme,
        });

        vi.mocked(useVariables).mockReturnValue({
            co2Rate: 0.5,
            setCo2Rate: mockSetCo2Rate,
            electricRate: 0.3,
            setElectricRate: mockSetElectricRate,
        });
    });

    it('sets the document title on mount', () => {
        render(<Settings />);
        expect(document.title).toBe('Réglages | SolarGen');
    });

    it('updates the theme when a tab trigger is clicked', () => {
        render(<Settings />);

        fireEvent.click(screen.getByTestId('trigger-dark'));

        expect(mockSetTheme).toHaveBeenCalledWith(THEME.DARK);
    });

    it('handles CO2 rate changes and saves the formatted value correctly', () => {
        render(<Settings />);

        const inputs = screen.getAllByRole('spinbutton');
        const co2Input = inputs[0];

        expect(co2Input).toHaveValue(0.5);
        expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();

        fireEvent.change(co2Input, {target: {value: '0.6789'}});

        const saveButton = screen.getByTestId('icon-check').closest('button');
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).not.toBeDisabled();

        fireEvent.click(saveButton as HTMLButtonElement);

        expect(mockSetCo2Rate).toHaveBeenCalledWith(0.679);
        expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
    });

    it('handles electric rate changes and saves the formatted value correctly', () => {
        render(<Settings />);

        const inputs = screen.getAllByRole('spinbutton');
        const electricInput = inputs[1];

        expect(electricInput).toHaveValue(0.3);

        fireEvent.change(electricInput, {target: {value: '0.45'}});

        const saveButton = screen.getByTestId('icon-check').closest('button');
        expect(saveButton).toBeInTheDocument();

        fireEvent.click(saveButton as HTMLButtonElement);

        expect(mockSetElectricRate).toHaveBeenCalledWith(0.45);
        expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
    });

    it('disables the save button and shows a title when the input value is invalid', () => {
        render(<Settings />);

        const inputs = screen.getAllByRole('spinbutton');
        const co2Input = inputs[0];

        fireEvent.change(co2Input, {target: {value: '-1.5'}});

        const saveButton = screen.getByTestId('icon-check').closest('button');
        expect(saveButton).toBeDisabled();
        expect(saveButton).toHaveAttribute('title', 'Entrez une valeur correcte.');
    });

    it('hides the save button if the user reverts the input to the original value', () => {
        render(<Settings />);

        const inputs = screen.getAllByRole('spinbutton');
        const electricInput = inputs[1];

        fireEvent.change(electricInput, {target: {value: '0.8'}});
        expect(screen.getByTestId('icon-check')).toBeInTheDocument();

        fireEvent.change(electricInput, {target: {value: '0.3'}});
        expect(screen.queryByTestId('icon-check')).not.toBeInTheDocument();
    });
});
