/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import SettingsBlock from './SettingsBlock';

vi.mock('@/components/ui/label', () => ({
    Label: vi.fn(({children, className}) => <label className={className}>{children}</label>),
}));

describe('SettingsBlock', () => {
    it('renders the title and children correctly', () => {
        render(
            <SettingsBlock title="Application Settings">
                <button>Save Configurations</button>
            </SettingsBlock>,
        );

        expect(screen.getByText('Application Settings')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'Save Configurations'})).toBeInTheDocument();
    });

    it('appends the optional className to the root container', () => {
        const {container} = render(
            <SettingsBlock title="Network Settings" className="custom-padding-class">
                <span>Config</span>
            </SettingsBlock>,
        );

        const rootElement = container.firstElementChild;
        expect(rootElement?.className).toContain('custom-padding-class');
    });

    it('does not append undefined to the class string when className is omitted', () => {
        const {container} = render(
            <SettingsBlock title="Default Block">
                <span>Content</span>
            </SettingsBlock>,
        );

        const rootElement = container.firstElementChild;
        expect(rootElement?.className).not.toContain('undefined');
    });
});
