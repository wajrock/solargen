import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import ComparisonBlock from './ComparisonBlock';
import styles from './ComparisonBlock.module.scss';

const baseProps = {
    title: 'Production totale',
    formatedCurrentValue: '87 456 kWh',
    currentYear: 2026,
    formatedReferenceValue: '78 234 kWh',
    referenceYear: 2025,
    absoluteTrend: false,
    unit: '%',
};

describe('ComparisonBlock', () => {
    it('renders the bars when currentValue is zero', () => {
        const {container} = render(<ComparisonBlock {...baseProps} currentValue={0} referenceValue={78234} />);

        expect(container.querySelector(`.${styles.skeleton}`)).not.toBeInTheDocument();
        expect(screen.getByText('2026')).toBeInTheDocument();
    });

    it('renders the bars when referenceValue is zero', () => {
        const {container} = render(<ComparisonBlock {...baseProps} currentValue={87456} referenceValue={0} />);

        expect(container.querySelector(`.${styles.skeleton}`)).not.toBeInTheDocument();
        expect(screen.getByText('2025')).toBeInTheDocument();
    });

    it('renders full-width bars when both values are zero', () => {
        render(<ComparisonBlock {...baseProps} currentValue={0} referenceValue={0} />);

        const currentBar = screen.getByText('2026').closest('div');
        const referenceBar = screen.getByText('2025').closest('div');

        expect(currentBar).toHaveStyle({width: '100%'});
        expect(referenceBar).toHaveStyle({width: '100%'});
    });

    it('renders the bars when both values are provided and non-zero', () => {
        const {container} = render(<ComparisonBlock {...baseProps} currentValue={87456} referenceValue={78234} />);

        expect(container.querySelector(`.${styles.skeleton}`)).not.toBeInTheDocument();
        expect(screen.getByText('87 456 kWh')).toBeInTheDocument();
        expect(screen.getByText('78 234 kWh')).toBeInTheDocument();
    });

    it('gives the larger value a full-width bar and the smaller a proportionally reduced one', () => {
        render(<ComparisonBlock {...baseProps} currentValue={100} referenceValue={50} />);

        const currentBar = screen.getByText('2026').closest('div');
        const referenceBar = screen.getByText('2025').closest('div');

        expect(currentBar).toHaveStyle({width: '100%'});
        expect(referenceBar).toHaveStyle({width: '70%'});
    });

    it('gives both bars full width when current and reference values are equal', () => {
        render(<ComparisonBlock {...baseProps} currentValue={100} referenceValue={100} />);

        const currentBar = screen.getByText('2026').closest('div');
        const referenceBar = screen.getByText('2025').closest('div');

        expect(currentBar).toHaveStyle({width: '100%'});
        expect(referenceBar).toHaveStyle({width: '100%'});
    });

    it('displays the year label inside each bar', () => {
        render(<ComparisonBlock {...baseProps} currentValue={87456} referenceValue={78234} />);

        expect(screen.getByText('2026')).toBeInTheDocument();
        expect(screen.getByText('2025')).toBeInTheDocument();
    });
});
