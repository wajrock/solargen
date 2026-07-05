import type {PERFORMANCE_LEVEL, Site} from '@/types/installation';
import {formatInverterModel} from '@/utils/formatters';
import {getAvgCapacityFactor, getInvertersType, getSitePerformance, getStandardDeviation} from '@/utils/installation';
import {useMemo, useState} from 'react';
import SiteFilters from './SiteFilters/SiteFilters';
import styles from './SitesBlock.module.scss';
import SitesTable from './SitesTable/SitesTable';

interface SitesBlockProps {
    sites: Site[];
    loading: boolean;
}

function SitesBlock({sites, loading}: SitesBlockProps) {
    // Hooks
    const [searchValue, setSearchValue] = useState('');
    const [inverterFilter, setInverterFilter] = useState<string>('all');
    const [performanceFilter, setPerformanceFilter] = useState<string>('all');

    // Memos
    const avgCapacityFactor = useMemo(() => getAvgCapacityFactor(sites), [sites]);
    const standardDeviation = useMemo(() => getStandardDeviation(sites, avgCapacityFactor), [sites, avgCapacityFactor]);

    const filteredSites = useMemo(
        () =>
            sites?.filter((site) => {
                const matchSearch =
                    `#${site.id}`.toLowerCase().includes(searchValue.toLowerCase()) ||
                    site.panel_model.toLowerCase().includes(searchValue.toLowerCase());

                const matchPerformance =
                    performanceFilter === 'all' ||
                    getSitePerformance(site.avg_capacity_factor, avgCapacityFactor, standardDeviation).type ===
                        (performanceFilter as PERFORMANCE_LEVEL);

                const matchInverter =
                    inverterFilter === 'all' ||
                    site.inverters.some((inverter) => formatInverterModel(inverter.model) === inverterFilter);

                return matchSearch && matchPerformance && matchInverter;
            }),

        [searchValue, inverterFilter, performanceFilter, sites, avgCapacityFactor, standardDeviation],
    );

    const inverters = useMemo(() => getInvertersType(sites), [sites]);

    return (
        <section className={styles.wrapper}>
            <div className={`block ${styles.sitesBlock}`}>
                <h2 className={'block-title'}>Mes sites</h2>
                <SiteFilters
                    invertersType={inverters}
                    search={searchValue}
                    onSearchChange={setSearchValue}
                    inverterFilter={inverterFilter}
                    onInverterFilterChange={setInverterFilter}
                    performanceFilter={performanceFilter}
                    onPerformanceFilterChange={setPerformanceFilter}
                />
                {!loading && filteredSites && filteredSites.length === 0 ? (
                    <p className={styles.noResults}>Aucun résultats</p>
                ) : (
                    <SitesTable
                        sites={filteredSites}
                        loading={loading}
                        avgCapacityFactor={avgCapacityFactor}
                        standardDeviation={standardDeviation}
                    />
                )}
            </div>
        </section>
    );
}

export default SitesBlock;
