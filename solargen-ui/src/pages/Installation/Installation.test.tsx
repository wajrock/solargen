/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import Installation from './index';
import {useInstallation} from '@/hooks/useInstallation';
import InstallationCards from './components/InstallationCards/InstallationCards';
import SitesBlock from './components/SitesBlock/SitesBlock';

vi.mock('@/hooks/useInstallation');
vi.mock('./components/InstallationCards/InstallationCards', () => ({
    default: vi.fn(() => <div data-testid="mock-installation-cards" />),
}));
vi.mock('./components/SitesBlock/SitesBlock', () => ({
    default: vi.fn(() => <div data-testid="mock-sites-block" />),
}));

describe('Installation', () => {
    const mockWindowOpen = vi.fn();

    beforeEach(() => {
        vi.stubGlobal('open', mockWindowOpen);
        vi.clearAllMocks();
        vi.mocked(useInstallation).mockReturnValue({
            installationData: undefined,
            loading: false,
            error: null,
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('displays an error message when the request fails', () => {
        vi.mocked(useInstallation).mockReturnValue({
            installationData: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        render(<Installation />);

        expect(screen.getByText('Impossible de charger les données')).toBeInTheDocument();
        expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    it('does not render InstallationCards or SitesBlock when there is an error', () => {
        vi.mocked(useInstallation).mockReturnValue({
            installationData: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        render(<Installation />);

        expect(screen.queryByTestId('mock-installation-cards')).not.toBeInTheDocument();
        expect(screen.queryByTestId('mock-sites-block')).not.toBeInTheDocument();
    });

    it('opens google maps with campus coordinates when the button is clicked', () => {
        render(<Installation />);

        fireEvent.click(screen.getByText(/Campus de Bundoora/i));

        expect(mockWindowOpen).toHaveBeenCalledTimes(1);
        expect(mockWindowOpen).toHaveBeenCalledWith('https://maps.google.com/?q=-37.71828652,145.0509752', '_blank');
    });

    it('passes installation data through to InstallationCards', () => {
        const mockData = {id: 'installation-123'};
        vi.mocked(useInstallation).mockReturnValue({
            installationData: mockData as any,
            loading: false,
            error: null,
        });

        render(<Installation />);

        expect(InstallationCards).toHaveBeenCalledWith(expect.objectContaining({data: mockData}), undefined);
    });

    it('defaults to an empty array for sites when installationData is undefined', () => {
        vi.mocked(useInstallation).mockReturnValue({
            installationData: undefined,
            loading: true,
            error: null,
        });

        render(<Installation />);

        expect(SitesBlock).toHaveBeenCalledWith(
            expect.objectContaining({
                sites: [],
                loading: true,
            }),
            undefined,
        );
    });

    it('defaults to an empty array for sites when sites property is missing', () => {
        vi.mocked(useInstallation).mockReturnValue({
            installationData: {} as any,
            loading: false,
            error: null,
        });

        render(<Installation />);

        expect(SitesBlock).toHaveBeenCalledWith(
            expect.objectContaining({
                sites: [],
                loading: false,
            }),
            undefined,
        );
    });

    it('passes the actual sites array to SitesBlock when present', () => {
        const mockSites = [{id: 'site-1'}, {id: 'site-2'}];
        vi.mocked(useInstallation).mockReturnValue({
            installationData: {sites: mockSites} as any,
            loading: false,
            error: null,
        });

        render(<Installation />);

        expect(SitesBlock).toHaveBeenCalledWith(
            expect.objectContaining({
                sites: mockSites,
                loading: false,
            }),
            undefined,
        );
    });
});
