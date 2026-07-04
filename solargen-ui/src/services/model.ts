import type {ModelInfo} from '@/types/model';
import {api} from './api';

export const getModelInfos = () => {
    return api.get<ModelInfo>('/model-info');
};
