import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import ActionMenu from './ActionMenu';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

function renderActionMenu(siteId = '0Y6D') {
    return render(
        <MemoryRouter>
            <ActionMenu siteId={siteId} />
        </MemoryRouter>,
    );
}

describe('ActionMenu', () => {
    it('navigates to predictions with the correct site id when clicked', async () => {
        const user = userEvent.setup();
        renderActionMenu('0Y6D');

        await user.click(document.querySelector('.lucide-ellipsis')!);
        await user.click(await screen.findByText('Prédictions'));

        expect(mockNavigate).toHaveBeenCalledWith('/predictions?site=0Y6D');
    });

    it('navigates to history with the correct site id when clicked', async () => {
        const user = userEvent.setup();
        renderActionMenu('CIDK');

        await user.click(document.querySelector('.lucide-ellipsis')!);
        await user.click(await screen.findByText('Historique'));

        expect(mockNavigate).toHaveBeenCalledWith('/history?site=CIDK');
    });
});
