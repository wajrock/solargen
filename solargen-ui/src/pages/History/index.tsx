import PageHeader from '@/components/shared/PageHeader/PageHeader';
import SiteSelect from '@/components/shared/SiteSelect/SiteSelect';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Separator} from '@/components/ui/separator';
import {getCurrentYearPastMonths} from '@/utils/history';
import {useEffect, useMemo, useState} from 'react';
import styles from './History.module.scss';
import useHistoryParams from './hooks/useHistoryParams';
import {useHistory} from '@/hooks/useHistory';
import Chart from '@/components/shared/Chart/Chart';
import {CHART_TYPE} from '@/types/chart';
import {
    formatCapacityFactor,
    formatCO2Savings,
    formatDate,
    formatEnergyPrice,
    formatProduction,
} from '@/utils/formatters';
import {getMelbourneToday} from '@/utils/date';
import ComparisonBlock from './components/ComparisonBlock/ComparisonBlock';
import useVariables from '@/hooks/useVariables';

function History() {
    const {monthParam, siteParam, handleMonthChange, handleSiteChange} = useHistoryParams();
    const [currentMonthLabel, setCurrentMonthLabel] = useState('');
    const {co2Rate, electricRate} = useVariables();

    useEffect(() => {
        document.title = 'Historique | SolarGen';
    }, []);

    const pastMonths = useMemo(() => getCurrentYearPastMonths(), []);

    const month = monthParam ?? String(getMelbourneToday().getMonth() + 1).padStart(2, '0');
    const {historyData} = useHistory(month, siteParam);
    const previousYearDailyByDay = useMemo(
        () => new Map(historyData?.previous_year.daily.map((day) => [day.date.slice(8, 10), day]) ?? []),
        [historyData],
    );
    const historyChartData = useMemo(
        () =>
            historyData?.current_year.daily.map((day) => ({
                timestamp: formatDate(new Date(day.date), 'dd/MM'),
                currentYearSolarGeneration: day.solar_generation,
                lastYearSolarGeneration: previousYearDailyByDay.get(day.date.slice(8, 10))?.solar_generation ?? 0,
            })) ?? [],
        [historyData, previousYearDailyByDay],
    );

    useEffect(() => {
        setCurrentMonthLabel(formatDate(new Date(`2025-${month}-01T00:00`), 'MMMM'));
    }, [month]);

    const currentYearSolarGeneration = historyData?.current_year.monthly.solar_generation ?? 0;
    const previousYearSolarGeneration = historyData?.previous_year.monthly.solar_generation ?? 0;

    const currentYearCapacityFactor = historyData?.current_year.monthly.capacity_factor ?? 0;
    const previousYearCapacityFactor = historyData?.previous_year.monthly.capacity_factor ?? 0;

    const currentYearCo2Savings = historyData ? historyData.current_year.monthly.solar_generation * co2Rate : 0;
    const previousYearCo2Savings = historyData ? historyData.previous_year.monthly.solar_generation * co2Rate : 0;

    const currentYearEnergyPrice = historyData ? historyData.current_year.monthly.solar_generation * electricRate : 0;
    const previousYearEnergyPrice = historyData ? historyData.previous_year.monthly.solar_generation * electricRate : 0;

    return (
        <main className={`page ${styles.history}`}>
            <PageHeader title={'Historique'}>
                <div id="actions" className={styles.actions}>
                    <Select value={monthParam ?? 'currentMonth'} onValueChange={handleMonthChange}>
                        <SelectTrigger className={`select-trigger ${styles.selectTrigger}`}>
                            <SelectValue placeholder="Tous les sites" />
                        </SelectTrigger>
                        <SelectContent
                            className="select-content"
                            position="popper"
                            side="bottom"
                            align="end"
                            sideOffset={4}
                        >
                            <SelectItem className={`select-item ${styles.selectItem}`} value="currentMonth">
                                Ce mois-ci
                            </SelectItem>
                            {pastMonths.map((month) => (
                                <SelectItem
                                    key={month.value}
                                    value={month.value}
                                    className={`select-item ${styles.selectItem}`}
                                >
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className={styles.separator}>
                        <Separator orientation="vertical" />
                    </div>

                    <SiteSelect value={siteParam} onChange={handleSiteChange} />
                </div>
            </PageHeader>
            <Chart
                className={styles.productionChart}
                data={historyChartData}
                xKey="timestamp"
                title="Production solaire sur 24h"
                tooltip="Productions prédites par le modèle."
                interval={(historyData?.current_year.daily ?? []).length > 25 ? 1 : 0}
                margin={{top: 1, right: 20, left: -20, bottom: -10}}
                series={[
                    {
                        type: CHART_TYPE.AREA,
                        key: 'currentYearSolarGeneration',
                        label: `Production ${currentMonthLabel} ${historyData?.current_year.year}`,
                        color: 'var(--cta-color)',
                        unit: 'kWh',
                    },
                    {
                        type: CHART_TYPE.LINE,
                        key: 'lastYearSolarGeneration',
                        label: `Production ${currentMonthLabel} ${historyData?.previous_year.year}`,
                        color: 'var(--secondary-text-color)',
                        showDash: true,
                        unit: 'kWh',
                    },
                ]}
            />
            <div className={styles.comparisonBlocks}>
                <ComparisonBlock
                    title={'Production totale'}
                    currentValue={currentYearSolarGeneration}
                    referenceValue={previousYearSolarGeneration}
                    absoluteTrend={false}
                    unit={'%'}
                    formatedCurrentValue={formatProduction(currentYearSolarGeneration)}
                    formatedReferenceValue={formatProduction(previousYearSolarGeneration)}
                    currentYear={historyData?.current_year.year ?? 0}
                    referenceYear={historyData?.previous_year.year ?? 0}
                />
                <ComparisonBlock
                    title={"Taux d'utilisation"}
                    currentValue={currentYearCapacityFactor * 100}
                    referenceValue={previousYearCapacityFactor * 100}
                    absoluteTrend={true}
                    unit={'%'}
                    formatedCurrentValue={formatCapacityFactor(currentYearCapacityFactor)}
                    formatedReferenceValue={formatCapacityFactor(previousYearCapacityFactor)}
                    currentYear={historyData?.current_year.year ?? 0}
                    referenceYear={historyData?.previous_year.year ?? 0}
                />
                <ComparisonBlock
                    title={'Économies CO₂'}
                    currentValue={currentYearCo2Savings}
                    referenceValue={previousYearCo2Savings}
                    absoluteTrend={true}
                    unit={' kgCo2'}
                    formatedCurrentValue={formatCO2Savings(currentYearSolarGeneration, co2Rate)}
                    formatedReferenceValue={formatCO2Savings(previousYearSolarGeneration, co2Rate)}
                    currentYear={historyData?.current_year.year ?? 0}
                    referenceYear={historyData?.previous_year.year ?? 0}
                />
                <ComparisonBlock
                    title={'Énergie valorisée'}
                    currentValue={currentYearEnergyPrice}
                    referenceValue={previousYearEnergyPrice}
                    absoluteTrend={true}
                    unit={' A$'}
                    formatedCurrentValue={formatEnergyPrice(currentYearSolarGeneration, electricRate)}
                    formatedReferenceValue={formatEnergyPrice(previousYearSolarGeneration, electricRate)}
                    currentYear={historyData?.current_year.year ?? 0}
                    referenceYear={historyData?.previous_year.year ?? 0}
                />
            </div>
        </main>
    );
}

export default History;
