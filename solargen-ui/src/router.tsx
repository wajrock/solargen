import {createBrowserRouter, Navigate} from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import Installation from './pages/Installation';
import History from './pages/History';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {index: true, element: <Navigate to={'/dashboard'} replace />},
            {path: 'dashboard', element: <Overview />},
            {path: 'installation', element: <Installation />},
            {path: 'historique', element: <History />},
            {path: 'reglages', element: <Settings />},
        ],
    },
]);
