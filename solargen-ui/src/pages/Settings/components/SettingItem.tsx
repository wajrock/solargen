import styles from './SettingItem.module.scss';

interface SettingItemProps {
    name: string;
    children: React.ReactNode;
}

function SettingItem({name, children}: SettingItemProps) {
    return (
        <div className={styles.settingItem}>
            <span className={styles.settingItemTitle}>{name}</span>
            {children}
        </div>
    );
}

export default SettingItem;
