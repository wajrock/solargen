import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {formatSiteId} from '@/utils/formatters';
import {useInstallation} from '@/hooks/useInstallation';
import styles from './SiteSelect.module.scss';

interface SiteSelectProps {
    value: string | undefined;
    onChange: (siteId: string | undefined) => void;
}

export default function SiteSelect({value, onChange}: SiteSelectProps) {
    const {installationData} = useInstallation();

    return (
        <Select value={value ?? 'all'} onValueChange={(val) => onChange(val === 'all' ? undefined : val)}>
            <SelectTrigger className={`select-trigger ${styles.selectTrigger}`}>
                <SelectValue placeholder="Tous les sites" />
            </SelectTrigger>
            <SelectContent
                className={`select-content ${styles.selectContent}`}
                position="popper"
                side="bottom"
                align="end"
                sideOffset={4}
            >
                <SelectItem className="select-item" value="all">
                    Tous les sites
                </SelectItem>
                {installationData?.sites.map((site) => (
                    <SelectItem key={site.id} value={site.id} className="select-item">
                        {formatSiteId(site.id)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
