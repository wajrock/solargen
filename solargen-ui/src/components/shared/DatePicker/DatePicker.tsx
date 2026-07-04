import {useState} from 'react';
import {format} from 'date-fns';
import {fr} from 'date-fns/locale';
import {CalendarIcon} from 'lucide-react';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {Calendar} from '@/components/ui/calendar';
import styles from './DatePicker.module.scss';
import {getMelbourneToday} from '@/utils/date';

interface DatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
}

export default function DatePicker({value, onChange, placeholder = "Aujourd'hui"}: DatePickerProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className={`${styles.trigger} ${value ? styles.selected : ''}`}>
                    <CalendarIcon size={16} />
                    {value ? format(value, 'd MMMM yyyy', {locale: fr}) : placeholder}
                </button>
            </PopoverTrigger>
            <PopoverContent className={styles.content} align="end">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                        onChange?.(date);
                        setOpen(false);
                    }}
                    className="p-0"
                    locale={fr}
                    today={getMelbourneToday()}
                    defaultMonth={value ?? getMelbourneToday()}
                    disabled={{before: new Date(2025, 0, 1), after: getMelbourneToday()}}
                />
            </PopoverContent>
        </Popover>
    );
}
