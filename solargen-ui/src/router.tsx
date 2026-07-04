import {createBrowserRouter, Navigate} from 'react-router-dom';
import Layout from './components/layout/Layout';
import History from './pages/History';
import Installation from './pages/Installation';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import {validateHistoryParams, validateOverviewParams} from './utils/validators';
import Model from './pages/Model';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {index: true, element: <Navigate to={'/predictions'} replace />},
            {path: 'predictions', element: <Overview />, loader: ({request}) => validateOverviewParams(request)},
            {path: 'installation', element: <Installation />},
            {path: 'history', element: <History />, loader: ({request}) => validateHistoryParams(request)},
            {path: 'model', element: <Model />},
            {path: 'settings', element: <Settings />},
        ],
    },
]);
