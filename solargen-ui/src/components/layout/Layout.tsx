import {Outlet} from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import styles from './Layout.module.scss';
import MobileHeader from './MobileHeader/MobileHeader';

export default function Layout() {
    return (
        <div className={styles.layout}>
            <Navbar />
            <MobileHeader />
            <Outlet />
        </div>
    );
}
