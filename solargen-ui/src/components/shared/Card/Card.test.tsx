import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';

describe('Card', () => {
    it('renders the name and children', () => {
        render(<Card name="Production Totale">2920.68 kWh</Card>);

        expect(screen.getByText('Production Totale')).toBeInTheDocument();
        expect(screen.getByText('2920.68 kWh')).toBeInTheDocument();
    });

    it('renders a skeleton instead of children when skeleton is true', () => {
        render(<Card name="Production Totale" skeleton />);

        expect(screen.getByText('Production Totale')).toBeInTheDocument();
        expect(screen.queryByText('2920.68 kWh')).not.toBeInTheDocument();
    });

    it('does not show the info icon before hovering', () => {
        render(
            <Card name="Taux d'Utilisation" infoTooltip="Explication du calcul">
                13.8%
            </Card>,
        );

        expect(screen.queryByText('Explication du calcul')).not.toBeInTheDocument();
    });

    it('renders the info icon on hover when infoTooltip is provided', async () => {
        const user = userEvent.setup();
        render(
            <Card name="Taux d'Utilisation" infoTooltip="Explication du calcul">
                13.8%
            </Card>,
        );

        const card = screen.getByText('13.8%').closest('div');
        await user.hover(card!);

        expect(document.querySelector('.lucide-info')).toBeInTheDocument();
    });

    it('removes the info icon after the mouse leaves', async () => {
        const user = userEvent.setup();
        render(
            <Card name="Taux d'Utilisation" infoTooltip="Explication du calcul">
                13.8%
            </Card>,
        );

        const card = screen.getByText('13.8%').closest('div');
        await user.hover(card!);
        expect(document.querySelector('.lucide-info')).toBeInTheDocument();

        await user.unhover(card!);
        expect(document.querySelector('.lucide-info')).not.toBeInTheDocument();
    });

    it('never shows a tooltip when infoTooltip is not provided, even on hover', async () => {
        const user = userEvent.setup();
        render(<Card name="Production Totale">2920.68 kWh</Card>);

        const card = screen.getByText('2920.68 kWh').closest('div');
        await user.hover(card!);

        expect(screen.queryByRole('img', {hidden: true})).not.toBeInTheDocument();
    });
});
