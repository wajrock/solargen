import Button from '../Button/Button';
import styles from './StateMessage.module.scss';

interface StateMessageProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    onRetry?: () => void;
    className?: string;
}

function StateMessage({icon, title, description, onRetry, className}: StateMessageProps) {
    return (
        <div className={`${styles.stateMessage} ${className}`}>
            {icon}
            <h3 className={styles.stateMessageTitle}>{title}</h3>
            {description && <p className={styles.stateMessageDescription}>{description}</p>}
            {onRetry && <Button onClick={onRetry}>Réessayer</Button>}
        </div>
    );
}

export default StateMessage;
