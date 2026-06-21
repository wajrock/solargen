import {Link, useLocation} from 'react-router-dom';
import {Home, Rows3, BookOpen, Settings, MapPin, CalendarClock} from 'lucide-react';
import styles from './Navbar.module.scss';
import Logo from '../shared/Logo';
import {useTime} from '../../hooks/useTime';

const navItems = [
    {path: '/dashboard', icon: Home, label: "Vue d'ensemble"},
    {path: '/installation', icon: Rows3, label: 'Installation'},
    {path: '/historique', icon: BookOpen, label: 'Historique'},
    {path: '/reglages', icon: Settings, label: 'Réglages'},
];

export default function Navbar() {
    const location = useLocation();
    const {date, time} = useTime();

    return (
        <nav className={styles.navbar}>
            <Link to={'/'} className={styles.logo}>
                <Logo />
            </Link>

            <ul className={styles.navList}>
                {navItems.map(({path, icon: Icon, label}) => (
                    <li key={path}>
                        <Link
                            to={path}
                            className={`${styles.navLink} ${location.pathname === path ? styles.active : ''}`}
                        >
                            <Icon className={styles.navIcon} />
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className={styles.navRight}>
                <span>
                    <CalendarClock />
                    {time} - {date}
                </span>

                <span>
                    <MapPin />
                    Melbourne, Australie
                </span>
            </div>
        </nav>
    );
}
