import {Info} from 'lucide-react';
import type React from 'react';
import {useState} from 'react';
import CustomTooltip from '../CustomTooltip/CustomTooltip';
import styles from './Card.module.scss';

interface CardProps {
    name?: string;
    children?: React.ReactNode;
    infoTooltip?: string;
    skeleton?: boolean;
}

function Card({name, children, skeleton, infoTooltip}: CardProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (skeleton) {
        return (
            <div className={styles.skeletonCard}>
                <span className={styles.cardName}>{name}</span>
                <div className={`${styles.skeletonValue} skeleton`} />
            </div>
        );
    }

    return (
        <div
            className={styles.card}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className={styles.cardHeader}>
                <span className={styles.cardName}>{name}</span>
                {infoTooltip && showTooltip && (
                    <CustomTooltip text={infoTooltip}>
                        <Info className={styles.infoIcon}></Info>
                    </CustomTooltip>
                )}
            </div>
            {children}
        </div>
    );
}

export default Card;
