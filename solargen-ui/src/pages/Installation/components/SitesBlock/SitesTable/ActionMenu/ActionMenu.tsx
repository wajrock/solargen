import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {BookOpen, EllipsisIcon, LineChartIcon} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import styles from './ActionMenu.module.scss';

interface ActionMenuProps {
    siteId: string;
}

function ActionMenu({siteId}: ActionMenuProps) {
    const navigate = useNavigate();

    const goToPredictions = () => {
        void navigate(`/predictions?site=${siteId}`);
    };

    const goToHistory = () => {
        void navigate(`/history?site=${siteId}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={styles.dropdownTrigger} asChild>
                <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className={styles.dropdownContent}>
                <DropdownMenuItem className={styles.dropdownItem} onClick={goToPredictions}>
                    <LineChartIcon />
                    Prédictions
                </DropdownMenuItem>
                <DropdownMenuItem className={styles.dropdownItem} onClick={goToHistory}>
                    <BookOpen />
                    Historique
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ActionMenu;
