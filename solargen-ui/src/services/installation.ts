import type {Installation} from '@/types/installation';
import {api} from './api';

export const getInstallation = () => {
    return api.get<Installation>('/installation');
};
