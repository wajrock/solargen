import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import TrendTag from './TrendTag';
import styles from './TrendTag.module.scss';

describe('TrendTag', () => {
    it('computes a relative percentage trend when absoluteTrend is false', () => {
        render(<TrendTag currentValue={110} referenceValue={100} absoluteTrend={false} unit="%" />);

        expect(screen.getByText('10.0%')).toBeInTheDocument();
    });

    it('computes an absolute difference trend when absoluteTrend is true', () => {
        render(<TrendTag currentValue={110} referenceValue={100} absoluteTrend={true} unit="kg" />);

        expect(screen.getByText('10.0kg')).toBeInTheDocument();
    });

    it('applies the positive class and up icon when the trend is positive', () => {
        render(<TrendTag currentValue={110} referenceValue={100} absoluteTrend={true} unit="kg" />);

        const tag = screen.getByText('10.0kg').closest('div');
        expect(tag).toHaveClass(styles.positiveLabel);
        expect(document.querySelector('.lucide-trending-up')).toBeInTheDocument();
    });

    it('applies the negative class and down icon when the trend is negative', () => {
        render(<TrendTag currentValue={90} referenceValue={100} absoluteTrend={true} unit="kg" />);

        const tag = screen.getByText('10.0kg').closest('div');
        expect(tag).toHaveClass(styles.negativeLabel);
        expect(document.querySelector('.lucide-trending-down')).toBeInTheDocument();
    });

    it('applies no trend class and no icon when the value equals the reference', () => {
        render(<TrendTag currentValue={100} referenceValue={100} absoluteTrend={true} unit="kg" />);

        const tag = screen.getByText('0.0kg').closest('div');
        expect(tag).not.toHaveClass(styles.positiveLabel);
        expect(tag).not.toHaveClass(styles.negativeLabel);
        expect(document.querySelector('.lucide-trending-up')).not.toBeInTheDocument();
        expect(document.querySelector('.lucide-trending-down')).not.toBeInTheDocument();
    });

    it('displays the absolute value of a negative relative trend, without a minus sign', () => {
        render(<TrendTag currentValue={90} referenceValue={100} absoluteTrend={false} unit="%" />);

        expect(screen.getByText('10.0%')).toBeInTheDocument();
    });

    it('avoids division by zero when the reference value is zero', () => {
        render(<TrendTag currentValue={100} referenceValue={0} absoluteTrend={false} unit="%" />);

        expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
});
