import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import Navbar from './Navbar';
import styles from './Navbar.module.scss';

vi.mock('../../../hooks/useTime', () => ({
    useTime: () => ({date: '15 juin 2026', time: '13:30'}),
}));

function renderNavbar(initialRoute: string) {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Navbar />
        </MemoryRouter>,
    );
}

describe('Navbar', () => {
    it('renders all main navigation links', () => {
        renderNavbar('/predictions');

        expect(screen.getByTestId('nav-link-/predictions')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-/installation')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-/history')).toBeInTheDocument();
    });

    it('renders all secondary navigation links', () => {
        renderNavbar('/predictions');

        expect(screen.getByTestId('nav-link-/model')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-/settings')).toBeInTheDocument();
    });

    it('marks the current page link as active', () => {
        renderNavbar('/installation');

        expect(screen.getByTestId('nav-link-/installation')).toHaveClass(styles.active);
    });

    it('does not mark other links as active', () => {
        renderNavbar('/installation');

        expect(screen.getByTestId('nav-link-/predictions')).not.toHaveClass(styles.active);
    });

    it('marks a secondary link as active when on the model page', () => {
        renderNavbar('/model');

        expect(screen.getByTestId('nav-link-/model')).toHaveClass(styles.active);
    });

    it('displays the current date from useTime', () => {
        renderNavbar('/predictions');

        expect(screen.getByTestId('current-date')).toHaveTextContent('15 juin 2026');
    });

    it('displays the copyright with the current year', () => {
        renderNavbar('/predictions');

        const currentYear = new Date().getFullYear();
        expect(screen.getByTestId('copyright')).toHaveTextContent(`© ${currentYear} Thibaud Wajrock`);
    });
});
