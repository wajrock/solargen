import {Label} from '@/components/ui/label';
import styles from './SettingsBlock.module.scss';

interface SettingsBlockProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

function SettingsBlock({title, children, className}: SettingsBlockProps) {
    return (
        <div className={`${styles.block} ${className ?? ''}`}>
            <Label className={styles.blockLabel}>{title}</Label>
            <div className={styles.blockContent}>{children}</div>
        </div>
    );
}

export default SettingsBlock;
