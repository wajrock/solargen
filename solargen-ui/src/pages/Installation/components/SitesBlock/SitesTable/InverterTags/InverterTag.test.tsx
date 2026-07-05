import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import InverterTags from './InverterTags';

describe('InverterTags', () => {
    it('renders one tag per inverter with formatted model and quantity', () => {
        render(
            <InverterTags
                inverters={[
                    {model: 'SolarEdge SE25K', quantity: 2},
                    {model: 'SolarEdge SE15K', quantity: 1},
                ]}
            />,
        );

        expect(screen.getByText('SE25K (x2)')).toBeInTheDocument();
        expect(screen.getByText('SE15K (x1)')).toBeInTheDocument();
    });

    it('renders nothing when inverters is an empty array', () => {
        const {container} = render(<InverterTags inverters={[]} />);

        expect(container.querySelectorAll('div').length).toBe(1); // juste le wrapper vide
    });
});
