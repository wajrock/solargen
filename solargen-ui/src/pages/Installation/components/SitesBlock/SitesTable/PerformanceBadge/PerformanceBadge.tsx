import type {PERFORMANCE_LEVEL} from '@/utils/installation';
import styles from './PerformanceBadge.module.scss';
interface PerformanceBadgeProps {
    type: PERFORMANCE_LEVEL;
    text: string;
}
function PerformanceBadge({text, type}: PerformanceBadgeProps) {
    return <div className={`${styles.badge} ${styles[type]}`}>{text}</div>;
}

export default PerformanceBadge;
