import {useState} from 'react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '../../ui/tooltip';
import styles from './CustomTooltip.module.scss';

interface CustomTooltipProps {
    text: string;
    children: React.ReactNode;
}

export default function CustomTooltip({text, children}: CustomTooltipProps) {
    const [open, setOpen] = useState(false);

    return (
        <TooltipProvider>
            <Tooltip open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild onClick={() => setOpen((prev) => !prev)}>
                    {children}
                </TooltipTrigger>
                <TooltipContent className={styles.tooltipContent}>
                    <p>{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
