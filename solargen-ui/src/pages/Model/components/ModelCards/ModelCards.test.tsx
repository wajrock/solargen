/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import ModelCards from './ModelCards';
import {formatDate} from '@/utils/formatters';
import Card from '@/components/shared/Card/Card';

vi.mock('@/utils/formatters');
vi.mock('@/components/shared/Card/Card', () => ({
    default: vi.fn(({children}) => <div>{children}</div>),
}));

describe('ModelCards', () => {
    const mockData = {
        model: 'RandomForest',
        r2: 0.95,
        mae: 14.2,
        train_start: '2022-01-01T00:00:00Z',
        train_end: '2023-01-01T00:00:00Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders skeleton cards when data is undefined', () => {
        render(<ModelCards data={undefined} loading={false} />);

        expect(Card).toHaveBeenCalledWith(expect.objectContaining({name: 'Algorithme', skeleton: true}), undefined);
        expect(Card).toHaveBeenCalledWith(expect.objectContaining({name: 'Score R²', skeleton: true}), undefined);
        expect(Card).toHaveBeenCalledWith(expect.objectContaining({name: 'Erreur moyenne', skeleton: true}), undefined);
        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({name: 'Période d’entrainement', skeleton: true}),
            undefined,
        );
    });

    it('renders skeleton cards when loading is true, even if data is present', () => {
        render(<ModelCards data={mockData as any} loading={true} />);

        expect(Card).toHaveBeenCalledWith(expect.objectContaining({name: 'Algorithme', skeleton: true}), undefined);
        expect(screen.queryByText('RandomForest')).not.toBeInTheDocument();
    });

    it('renders model metrics correctly when data is provided and loading is false', () => {
        vi.mocked(formatDate).mockReturnValue('formatted date');

        render(<ModelCards data={mockData as any} loading={false} />);

        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Algorithme',
                infoTooltip: expect.any(String),
            }),
            undefined,
        );
        expect(screen.getByText('RandomForest')).toBeInTheDocument();

        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Score R²',
                infoTooltip: expect.any(String),
            }),
            undefined,
        );
        expect(screen.getByText('0.95')).toBeInTheDocument();

        expect(Card).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Erreur moyenne',
                infoTooltip: expect.any(String),
            }),
            undefined,
        );
        expect(screen.getByText('14.2')).toBeInTheDocument();
    });

    it('formats and displays the training period dates correctly', () => {
        vi.mocked(formatDate).mockReturnValueOnce('Janvier 2022').mockReturnValueOnce('Décembre 2022');

        render(<ModelCards data={mockData as any} loading={false} />);

        expect(formatDate).toHaveBeenCalledWith(new Date('2022-01-01T00:00:00Z'), 'MMMM yyyy');
        expect(formatDate).toHaveBeenCalledWith(new Date('2023-01-01T00:00:00Z'), 'MMMM yyyy');
        expect(screen.getByText('Janvier 2022 → Décembre 2022')).toBeInTheDocument();
    });
});
