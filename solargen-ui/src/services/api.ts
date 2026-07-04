import axios, {type AxiosInstance} from 'axios';

export const api: AxiosInstance = axios.create({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    baseURL: import.meta.env.VITE_API_URL,
});
