import {Separator} from '@/components/ui/separator';
import {useTime} from '@/hooks/useTime';
import {BookOpen, Bot, CalendarClock, Home, MapPin, Menu, Rows3, Settings, XIcon} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import Logo from '../Logo/Logo';
import styles from './MobileHeader.module.scss';

function MobileHeader() {
    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    const location = useLocation();
    const {date} = useTime();

    const pagesLinks = [
        {path: '/predictions', icon: Home, label: 'Prédictions'},
        {path: '/installation', icon: Rows3, label: 'Installation'},
        {path: '/history', icon: BookOpen, label: 'Historique'},
    ];

    const systemLinks = [
        {path: '/model', icon: Bot, label: 'Modèle ML'},
        {path: '/settings', icon: Settings, label: 'Réglages'},
    ];

    useEffect(() => {
        if (!openMenu) return;

        function handleClickOutside(e: MouseEvent) {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setOpenMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenu]);

    return (
        <section className={styles.mobileHeader}>
            <Link to={'/'} className={styles.logo}>
                <Logo />
            </Link>

            <div onClick={() => setOpenMenu(true)} data-testid="open-menu-button">
                <Menu />
            </div>
            {openMenu && (
                <div className={styles.mobileMenuOverlay}>
                    <div className={styles.drawerMenu} ref={drawerRef}>
                        <div
                            className={styles.btnCloseDrawerMenu}
                            onClick={() => setOpenMenu(false)}
                            data-testid="close-menu-button"
                        >
                            <XIcon />
                        </div>
                        <nav className={styles.mobileNavBar} data-testid="navbar">
                            <ul className={styles.navList}>
                                {pagesLinks.map(({path, icon: Icon, label}) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            onClick={() => setOpenMenu(false)}
                                            data-testid={`nav-link-${path}`}
                                            className={`${styles.navLink} ${location.pathname === path ? styles.active : ''}`}
                                        >
                                            <Icon className={styles.navIcon} strokeWidth={2.2} />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <Separator className={styles.separator} />

                            <ul className={styles.secondaryNavList}>
                                {systemLinks.map(({path, icon: Icon, label}) => (
                                    <li key={path}>
                                        <Link
                                            to={path}
                                            onClick={() => setOpenMenu(false)}
                                            data-testid={`nav-link-${path}`}
                                            className={`${styles.navLink} ${location.pathname === path ? styles.active : ''}`}
                                        >
                                            <Icon className={styles.navIcon} strokeWidth={2.2} />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className={styles.locationInfos}>
                                <span>
                                    <MapPin />
                                    Melbourne (AU)
                                </span>
                                <span data-testid="current-date">
                                    <CalendarClock />
                                    {date}
                                </span>
                            </div>

                            <Separator className={styles.separator} />

                            <Link to={'https://wajrock.me/'} target="_blank">
                                <p className={styles.copyright} data-testid="copyright">
                                    © {new Date().getFullYear()} Thibaud Wajrock
                                </p>
                            </Link>
                        </nav>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MobileHeader;
