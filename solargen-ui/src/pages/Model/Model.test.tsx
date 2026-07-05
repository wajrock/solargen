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
    AlertCircle: vi.fn(() => <svg data-testid="icon-alert-circle" />),
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
            loading: true,
            error: null,
        });

        vi.mocked(formatDate).mockReturnValue('mocked date');
        vi.mocked(isoStringToLocalDate).mockReturnValue(new Date('2026-01-01T00:00:00Z'));
        vi.mocked(formatPredictionsStatusTooltip).mockReturnValue('mocked tooltip');
    });

    it('always renders the header, even when a section fails', () => {
        vi.mocked(useModelInfo).mockReturnValue({
            modelInfoData: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        render(<Model />);

        expect(screen.getByText('Modèle Machine Learning')).toBeInTheDocument();
        expect(screen.getByText('Voir le rapport')).toBeInTheDocument();
    });

    it('displays an error message in the model info section when it fails, without affecting the predictions section', () => {
        vi.mocked(useModelInfo).mockReturnValue({
            modelInfoData: undefined,
            loading: false,
            error: new Error('Network error'),
        });
        vi.mocked(usePredictionsStatus).mockReturnValue({
            predictionsStatusData: {date: '2026-07-05', fetched_at: '2026-07-05T12:00:00Z', is_complete: true} as any,
            loading: false,
            error: null,
        });

        render(<Model />);

        expect(screen.getByText('Impossible de charger les informations du modèle')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-model-cards')).not.toBeInTheDocument();
        expect(screen.getByTestId('icon-circle-check')).toBeInTheDocument();
    });

    it('displays an error message in the predictions status section when it fails, without affecting the model info section', () => {
        vi.mocked(useModelInfo).mockReturnValue({
            modelInfoData: {model: 'LightGBM'} as any,
            loading: false,
            error: null,
        });
        vi.mocked(usePredictionsStatus).mockReturnValue({
            predictionsStatusData: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        render(<Model />);

        expect(screen.getByText('Impossible de charger le statut des prédictions')).toBeInTheDocument();
        expect(screen.getByTestId('mock-model-cards')).toBeInTheDocument();
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

    it('renders skeleton loaders when statusLoading is true', () => {
        const {container} = render(<Model />);

        expect(screen.queryByTestId('mock-tooltip')).not.toBeInTheDocument();
        const skeletons = container.querySelectorAll('.skeleton');
        expect(skeletons).toHaveLength(3);
    });

    it('does not render skeleton loaders once loading is false and data is present', () => {
        vi.mocked(usePredictionsStatus).mockReturnValue({
            predictionsStatusData: {date: '2026-07-05', fetched_at: '2026-07-05T12:00:00Z', is_complete: true} as any,
            loading: false,
            error: null,
        });

        const {container} = render(<Model />);

        expect(container.querySelectorAll('.skeleton')).toHaveLength(0);
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
