/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import Model from './index';
import useModelInfo from '@/hooks/useModelInfo';
import {usePredictionsStatus} from '@/hooks/usePrediction';
import ModelCards from './components/ModelCards/ModelCards';
import {formatDate} from '@/utils/formatters';
import {isoStringToLocalDate} from '@/utils/date';
import {formatPredictionsStatusTooltip} from './utils/formatPredictionsStatusTooltip';

vi.mock('@/hooks/useModelInfo');
vi.mock('@/hooks/usePrediction');
vi.mock('@/utils/formatters');
vi.mock('@/utils/date');
vi.mock('./utils/formatPredictionsStatusTooltip');

vi.mock('./components/ModelCards/ModelCards', () => ({
    default: vi.fn(() => <div data-testid="mock-model-cards" />),
}));

vi.mock('@/components/shared/CustomTooltip/CustomTooltip', () => ({
    default: vi.fn(({children, text}) => (
        <div data-testid="mock-tooltip" data-text={text}>
            {children}
        </div>
    )),
}));

vi.mock('lucide-react', () => ({
    CircleCheck: vi.fn(() => <svg data-testid="icon-circle-check" />),
    CircleX: vi.fn(() => <svg data-testid="icon-circle-x" />),
}));

describe('Model', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useModelInfo).mockReturnValue({
            modelInfoData: undefined,
            loading: false,
            error: null,
        });

        vi.mocked(usePredictionsStatus).mockReturnValue({
            predictionsStatusData: undefined,
            loading: false,
            error: null,
        });

        vi.mocked(formatDate).mockReturnValue('mocked date');
        vi.mocked(isoStringToLocalDate).mockReturnValue(new Date('2026-01-01T00:00:00Z'));
        vi.mocked(formatPredictionsStatusTooltip).mockReturnValue('mocked tooltip');
    });

    it('sets the document title on mount', () => {
        render(<Model />);
        expect(document.title).toBe('Modèle ML | SolarGen');
    });

    it('passes modelInfoData to ModelCards', () => {
        const mockModelData = {model: 'RandomForest'};
        vi.mocked(useModelInfo).mockReturnValue({
            modelInfoData: mockModelData as any,
            loading: false,
            error: null,
        });

        render(<Model />);

        expect(ModelCards).toHaveBeenCalledWith(expect.objectContaining({data: mockModelData}), undefined);
    });

    it('renders skeleton loaders when predictionsStatusData is undefined', () => {
        const {container} = render(<Model />);

        expect(screen.queryByTestId('mock-tooltip')).not.toBeInTheDocument();
        const skeletons = container.querySelectorAll('.skeleton');
        expect(skeletons).toHaveLength(3);
    });

    it('renders success prediction status with correctly formatted dates when is_complete is true', () => {
        const mockStatusData = {
            date: '2026-07-05',
            fetched_at: '2026-07-05T12:00:00Z',
            is_complete: true,
        };

        vi.mocked(usePredictionsStatus).mockReturnValue({
            predictionsStatusData: mockStatusData as any,
            loading: false,
            error: null,
        });

        vi.mocked(formatDate).mockReturnValueOnce('05 juillet 2026').mockReturnValueOnce('05/07/26 à 14:00');

        render(<Model />);

        expect(formatPredictionsStatusTooltip).toHaveBeenCalledWith(mockStatusData);
        expect(screen.getByTestId('mock-tooltip')).toHaveAttribute('data-text', 'mocked tooltip');

        expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument();
        expect(screen.queryByTestId('icon-circle-x')).not.toBeInTheDocument();

        expect(isoStringToLocalDate).toHaveBeenCalledWith('2026-07-05T12:00:00Z');
        expect(screen.getByText('Prédictions du 05 juillet 2026')).toBeInTheDocument();
        expect(screen.getByText('Calculées le 05/07/26 à 14:00')).toBeInTheDocument();
    });

    it('renders error prediction status icon when is_complete is false', () => {
        vi.mocked(usePredictionsStatus).mockReturnValue({
            predictionsStatusData: {
                date: '2026-07-05',
                fetched_at: '2026-07-05T12:00:00Z',
                is_complete: false,
            } as any,
            loading: false,
            error: null,
        });

        render(<Model />);

        expect(screen.getByTestId('icon-circle-x')).toBeInTheDocument();
        expect(screen.queryByTestId('icon-circle-check')).not.toBeInTheDocument();
    });
});
