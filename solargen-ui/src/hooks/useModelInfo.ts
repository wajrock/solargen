import {getModelInfos} from '@/services/model';
import type {ModelInfo} from '@/types/model';
import {useQuery} from '@tanstack/react-query';

function useModelInfo() {
    const {data, isLoading, error} = useQuery<ModelInfo>({
        queryKey: ['model-info'],
        queryFn: () => getModelInfos().then((res) => res.data),
        staleTime: Infinity,
    });

    return {modelInfoData: data, loading: isLoading, error};
}

export default useModelInfo;
