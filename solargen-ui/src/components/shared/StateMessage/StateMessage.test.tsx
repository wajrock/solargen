import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StateMessage from './StateMessage';

describe('StateMessage', () => {
    it('renders the title', () => {
        render(<StateMessage title="Impossible de charger les données" />);

        expect(screen.getByText('Impossible de charger les données')).toBeInTheDocument();
    });

    it('renders the icon when provided', () => {
        render(<StateMessage title="Erreur" icon={<span data-testid="custom-icon" />} />);

        expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
        render(<StateMessage title="Erreur" description="Vérifiez votre connexion." />);

        expect(screen.getByText('Vérifiez votre connexion.')).toBeInTheDocument();
    });

    it('does not render a description when not provided', () => {
        render(<StateMessage title="Erreur" />);

        expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
    });

    it('does not render a retry button when onRetry is not provided', () => {
        render(<StateMessage title="Aucune donnée" />);

        expect(screen.queryByText('Réessayer')).not.toBeInTheDocument();
    });

    it('renders a retry button when onRetry is provided', () => {
        render(<StateMessage title="Erreur" onRetry={vi.fn()} />);

        expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('calls onRetry when the retry button is clicked', async () => {
        const handleRetry = vi.fn();
        const user = userEvent.setup();

        render(<StateMessage title="Erreur" onRetry={handleRetry} />);

        await user.click(screen.getByText('Réessayer'));

        expect(handleRetry).toHaveBeenCalledTimes(1);
    });
});
