import type {Inverter} from '@/types/installation';
import styles from './InverterTags.module.scss';
import {formatInverterModel} from '@/utils/formatters';

interface InverterTagsProps {
    inverters: Inverter[];
}

function InverterTags({inverters}: InverterTagsProps) {
    return (
        <div className={styles.inverters}>
            {inverters.map((inverter, index) => (
                <div key={index} className={styles.inverter}>
                    {formatInverterModel(inverter.model)} (x{inverter.quantity})
                </div>
            ))}
        </div>
    );
}

export default InverterTags;
