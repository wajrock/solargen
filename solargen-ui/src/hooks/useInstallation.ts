import {getInstallation} from '@/services/installation';
import type {Installation} from '@/types/installation';
import {useQuery} from '@tanstack/react-query';

export function useInstallation() {
    const {data, isLoading, error} = useQuery<Installation>({
        queryKey: ['installation'],
        queryFn: () => getInstallation().then((res) => res.data),
        staleTime: Infinity,
    });

    return {installationData: data, loading: isLoading, error};
}
