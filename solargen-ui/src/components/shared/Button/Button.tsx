import styles from './Button.module.scss';

interface ButtonProps {
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    title?: string;
}

function Button({className, children, onClick, disabled, title}: ButtonProps) {
    return (
        <button className={`${styles.button} ${className ?? ''}`} onClick={onClick} disabled={disabled} title={title}>
            {children}
        </button>
    );
}

export default Button;
