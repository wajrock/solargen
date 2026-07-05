import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatePicker from './DatePicker';

describe('DatePicker', () => {
    it('displays the placeholder when no value is selected', () => {
        render(<DatePicker />);

        expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
    });

    it('displays a custom placeholder when provided', () => {
        render(<DatePicker placeholder="Choisir une date" />);

        expect(screen.getByText('Choisir une date')).toBeInTheDocument();
    });

    it('displays the formatted date when a value is provided', () => {
        render(<DatePicker value={new Date(2026, 5, 15)} />);

        expect(screen.getByText('15 juin 2026')).toBeInTheDocument();
    });

    it('applies the selected style class when a value is provided', () => {
        render(<DatePicker value={new Date(2026, 5, 15)} />);

        const trigger = screen.getByRole('button');
        expect(trigger.className).toContain('selected');
    });

    it('does not apply the selected style class when no value is provided', () => {
        render(<DatePicker />);

        const trigger = screen.getByRole('button');
        expect(trigger.className).not.toContain('selected');
    });

    it('opens the calendar popover when the trigger is clicked', async () => {
        const user = userEvent.setup();
        render(<DatePicker />);

        const trigger = screen.getByRole('button');
        await user.click(trigger);

        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('calls onChange with the selected date', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        render(<DatePicker value={new Date(2026, 5, 15)} onChange={handleChange} />);

        const trigger = screen.getByRole('button');
        await user.click(trigger);

        const dayButton = screen.getByRole('button', {name: /16/});
        await user.click(dayButton);

        expect(handleChange).toHaveBeenCalledWith(expect.any(Date));
    });

    it('closes the popover after selecting a date', async () => {
        const user = userEvent.setup();
        render(<DatePicker value={new Date(2026, 5, 15)} />);

        const trigger = screen.getByRole('button');
        await user.click(trigger);
        expect(screen.getByRole('grid')).toBeInTheDocument();

        const dayButton = screen.getByRole('button', {name: /16/});
        await user.click(dayButton);

        expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
});
