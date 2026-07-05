import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import Tag from './Tag';

describe('Tag', () => {
    it('renders the given text', () => {
        render(<Tag text="SE25K" />);

        expect(screen.getByText('SE25K')).toBeInTheDocument();
    });
});
