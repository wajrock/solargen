import {Outlet} from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import styles from './Layout.module.scss';
import MobileHeader from './MobileHeader/MobileHeader';
import ScrollToTop from './ScrollToTop';

export default function Layout() {
    return (
        <div id="app-layout" className={styles.layout}>
            <Navbar />
            <MobileHeader />
            <ScrollToTop />
            <Outlet />
        </div>
    );
}
