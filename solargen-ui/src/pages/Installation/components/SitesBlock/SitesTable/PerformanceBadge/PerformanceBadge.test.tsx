import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import PerformanceBadge from './PerformanceBadge';
import styles from './PerformanceBadge.module.scss';
import {PERFORMANCE_LEVEL} from '@/types/installation';

describe('PerformanceBadge', () => {
    it('renders the given text', () => {
        render(<PerformanceBadge type={PERFORMANCE_LEVEL.HIGH} text="Excellent" />);

        expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('applies the correct class for the high performance level', () => {
        render(<PerformanceBadge type={PERFORMANCE_LEVEL.HIGH} text="Excellent" />);

        expect(screen.getByText('Excellent')).toHaveClass(styles.high);
    });

    it('applies the correct class for the normal performance level', () => {
        render(<PerformanceBadge type={PERFORMANCE_LEVEL.NORMAL} text="Normal" />);

        expect(screen.getByText('Normal')).toHaveClass(styles.normal);
    });

    it('applies the correct class for the low performance level', () => {
        render(<PerformanceBadge type={PERFORMANCE_LEVEL.LOW} text="Faible" />);

        expect(screen.getByText('Faible')).toHaveClass(styles.low);
    });
});
