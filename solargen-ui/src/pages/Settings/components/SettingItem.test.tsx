import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import SettingItem from './SettingItem';

describe('SettingItem', () => {
    it('renders the item name and its children', () => {
        render(
            <SettingItem name="Dark Mode">
                <input type="checkbox" aria-label="Toggle dark mode" />
            </SettingItem>,
        );

        expect(screen.getByText('Dark Mode')).toBeInTheDocument();
        expect(screen.getByRole('checkbox', {name: 'Toggle dark mode'})).toBeInTheDocument();
    });
});
