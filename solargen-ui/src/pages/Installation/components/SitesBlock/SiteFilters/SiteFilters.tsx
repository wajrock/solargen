import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {CircleX, Search} from 'lucide-react';
import styles from './SiteFilters.module.scss';
import {PERFORMANCE_LEVEL} from '@/types/installation';

interface SiteFilterProps {
    invertersType: string[];
    search: string;
    onSearchChange: (value: string) => void;
    inverterFilter: string;
    onInverterFilterChange: (value: string) => void;
    performanceFilter: string;
    onPerformanceFilterChange: (value: string) => void;
}

function SiteFilters({
    invertersType,
    search,
    onSearchChange,
    inverterFilter,
    onInverterFilterChange,
    performanceFilter,
    onPerformanceFilterChange,
}: SiteFilterProps) {
    return (
        <div className={styles.filters}>
            <div className={styles.searchbar}>
                <Search className={styles.searchIcon} />
                <Input
                    className={styles.searchInput}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Rechercher un site par identifiant ou modèle.."
                />
                {search.length > 0 && <CircleX className={styles.clearSearchIcon} onClick={() => onSearchChange('')} />}
            </div>
            <div className={styles.selectWrapper}>
                <Label className={styles.selectLabel} htmlFor="inverter-filter">
                    Ondulateur
                </Label>
                <Select value={inverterFilter} onValueChange={(val: string) => onInverterFilterChange(val)}>
                    <SelectTrigger id="inverter-filter" className={`select-trigger ${styles.selectTrigger}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        className="select-content"
                        position="popper"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <SelectItem className="select-item" value="all">
                            Tous
                        </SelectItem>
                        {invertersType.map((inverter, index) => (
                            <SelectItem key={index} className="select-item" value={inverter}>
                                {inverter}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className={styles.selectWrapper}>
                <Label className={styles.selectLabel} htmlFor="performance-filter">
                    Performance
                </Label>
                <Select value={performanceFilter} onValueChange={(val: string) => onPerformanceFilterChange(val)}>
                    <SelectTrigger id="performance-filter" className={`select-trigger ${styles.selectTrigger}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        className="select-content"
                        position="popper"
                        side="bottom"
                        align="end"
                        sideOffset={4}
                    >
                        <SelectItem className="select-item" value="all">
                            Tous
                        </SelectItem>
                        <SelectItem className="select-item" value={PERFORMANCE_LEVEL.HIGH}>
                            Excellent
                        </SelectItem>
                        <SelectItem className="select-item" value={PERFORMANCE_LEVEL.NORMAL}>
                            Normal
                        </SelectItem>
                        <SelectItem className="select-item" value={PERFORMANCE_LEVEL.LOW}>
                            Faible
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export default SiteFilters;
