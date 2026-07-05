/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios, {type AxiosInstance} from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://api--solargen-backend--mdh6jkptypjr.code.run';

export const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
});
