import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '../../ui/tooltip';
import styles from './CustomTooltip.module.scss';

interface CustomTooltipProps {
    text: string;
    children: React.ReactNode;
}

export default function CustomTooltip({text, children}: CustomTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent className={styles.tooltipContent}>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
