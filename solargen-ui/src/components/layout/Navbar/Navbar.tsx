import {Separator} from '@/components/ui/separator';
import {BookOpen, Bot, CalendarClock, Home, MapPin, Rows3, Settings} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';
import {useTime} from '../../../hooks/useTime';
import Logo from '../Logo/Logo';
import styles from './Navbar.module.scss';

interface NavbarProps {
    classname?: string;
}

export default function Navbar({classname}: NavbarProps) {
    // Hooks
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

    return (
        <nav className={`${styles.navbar} ${classname}`} data-testid="navbar">
            <Link to={'/'} className={styles.logo}>
                <Logo />
            </Link>
            <Separator className={styles.separator} />

            <ul className={styles.navList}>
                {pagesLinks.map(({path, icon: Icon, label}) => (
                    <li key={path}>
                        <Link
                            to={path}
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
    );
}
