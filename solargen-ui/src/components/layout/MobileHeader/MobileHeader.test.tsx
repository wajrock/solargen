import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import MobileHeader from './MobileHeader';

vi.mock('@/hooks/useTime', () => ({
    useTime: () => ({date: '15 juin 2026', time: '13:30'}),
}));

function renderMobileHeader(initialRoute = '/predictions') {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <MobileHeader />
        </MemoryRouter>,
    );
}

describe('MobileHeader', () => {
    it('does not render the navigation menu by default', () => {
        renderMobileHeader();

        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    });

    it('opens the navigation menu when the menu button is clicked', async () => {
        const user = userEvent.setup();
        renderMobileHeader();

        await user.click(screen.getByTestId('open-menu-button'));

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('closes the menu when the close button is clicked', async () => {
        const user = userEvent.setup();
        renderMobileHeader();

        await user.click(screen.getByTestId('open-menu-button'));
        expect(screen.getByTestId('navbar')).toBeInTheDocument();

        await user.click(screen.getByTestId('close-menu-button'));
        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    });

    it('closes the menu automatically when a main navigation link is clicked', async () => {
        const user = userEvent.setup();
        renderMobileHeader();

        await user.click(screen.getByTestId('open-menu-button'));
        await user.click(screen.getByTestId('nav-link-/installation'));

        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    });

    it('closes the menu automatically when a secondary navigation link is clicked', async () => {
        const user = userEvent.setup();
        renderMobileHeader();

        await user.click(screen.getByTestId('open-menu-button'));
        await user.click(screen.getByTestId('nav-link-/settings'));

        expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    });

    it('marks the current main page link as active when the menu is open', async () => {
        const user = userEvent.setup();
        renderMobileHeader('/installation');

        await user.click(screen.getByTestId('open-menu-button'));

        expect(screen.getByTestId('nav-link-/installation').className).toContain('active');
        expect(screen.getByTestId('nav-link-/predictions').className).not.toContain('active');
    });

    it('marks the current secondary page link as active when the menu is open', async () => {
        const user = userEvent.setup();
        renderMobileHeader('/model');

        await user.click(screen.getByTestId('open-menu-button'));

        expect(screen.getByTestId('nav-link-/model').className).toContain('active');
    });

    it('displays the current date from useTime when the menu is open', async () => {
        const user = userEvent.setup();
        renderMobileHeader();

        await user.click(screen.getByTestId('open-menu-button'));

        expect(screen.getByTestId('current-date')).toHaveTextContent('15 juin 2026');
    });

    it('displays the copyright with the current year when the menu is open', async () => {
        const user = userEvent.setup();
        renderMobileHeader();

        await user.click(screen.getByTestId('open-menu-button'));

        const currentYear = new Date().getFullYear();
        expect(screen.getByTestId('copyright')).toHaveTextContent(`© ${currentYear} Thibaud Wajrock`);
    });
});
