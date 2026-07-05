import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import CustomTooltip from './CustomTooltip';

describe('CustomTooltip', () => {
    it('renders the trigger children', () => {
        render(
            <CustomTooltip text="Explication du calcul">
                <button>Hover me</button>
            </CustomTooltip>,
        );

        expect(screen.getByText('Hover me')).toBeInTheDocument();
    });
});
