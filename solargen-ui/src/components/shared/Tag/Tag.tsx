import styles from './Tag.module.scss';

interface TagProps {
    text: string;
}

function Tag({text}: TagProps) {
    return (
        <div className={styles.tag}>
            <span>{text}</span>
        </div>
    );
}

export default Tag;
