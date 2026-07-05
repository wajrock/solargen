import {Outlet} from 'react-router-dom';
import Navbar from './Navbar/Navbar';

export default function Layout() {
    return (
        <div className="layout">
            <Navbar />
            <Outlet />
        </div>
    );
}
