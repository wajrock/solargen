import Chart from '@/components/shared/Chart/Chart';
import DatePicker from '@/components/shared/DatePicker/DatePicker';
import SiteSelect from '@/components/shared/SiteSelect/SiteSelect';
import {usePredictions} from '@/hooks/usePrediction';
import {CHART_TYPE} from '@/types/chart';
import {formatDate} from '@/utils/formatters';
import {useEffect} from 'react';
import PageHeader from '../../components/shared/PageHeader/PageHeader';
import OverviewCards from './components/OverviewCards/OverviewCards';
import useOverviewParams from './hooks/useOverviewParams';
import styles from './Overview.module.scss';
import {Separator} from '@/components/ui/separator';
import {getMelbourneToday} from '@/utils/date';

function Overview() {
    const {date, siteId, handleDateChange, handleSiteChange} = useOverviewParams();

    const formatedDate = date ? formatDate(date, 'yyyy-MM-dd') : undefined;
    const {predictionsData} = usePredictions(formatedDate, siteId);

    useEffect(() => {
        document.title = 'Tableau de bord | SolarGen';
    }, []);

    return (
        <main className={`page ${styles.overview}`}>
            <PageHeader title={'Tableau de bord'}>
                <div id="actions" className={styles.actions}>
                    <DatePicker value={date} onChange={handleDateChange} />
                    <div className={styles.separator}>
                        <Separator orientation="vertical" />
                    </div>
                    <SiteSelect value={siteId} onChange={handleSiteChange} />
                </div>
            </PageHeader>
            <OverviewCards data={predictionsData} />
            <Chart
                data={
                    predictionsData?.hourly.map((hour) => ({
                        timestamp: formatDate(new Date(hour.timestamp), 'HH:mm'),
                        solarGeneration: hour.production.solar_generation,
                        monthlyAvgSolarGeneration: hour.production.monthly_avg.solar_generation,
                    })) ?? []
                }
                xKey="timestamp"
                title="Production solaire sur 24h"
                tooltip="Productions prédites par le modèle."
                interval={2}
                margin={{top: 1, right: 0, left: siteId ? -35 : -25, bottom: -10}}
                series={[
                    {
                        type: CHART_TYPE.AREA,
                        key: 'solarGeneration',
                        label: date ? formatDate(date, 'd MMMM') : "Aujourd'hui",
                        color: 'var(--cta-color)',
                        unit: 'kWh',
                    },
                    {
                        type: CHART_TYPE.LINE,
                        showDash: true,
                        key: 'monthlyAvgSolarGeneration',
                        label: `Moyenne ${(date ?? getMelbourneToday()).toLocaleString('fr-FR', {month: 'long'})}`,
                        color: 'gray',
                        unit: 'kWh',
                    },
                ]}
            />
            <div className={styles.weatherCharts}>
                <Chart
                    data={
                        predictionsData?.hourly.map((hour) => ({
                            timestamp: formatDate(new Date(hour.timestamp), 'HH:mm'),
                            shortwaveRadiation: hour.weather.shortwave_radiation,
                            diffuseRadiation: hour.weather.diffuse_radiation,
                        })) ?? []
                    }
                    xKey="timestamp"
                    title="Rayonnement solaire"
                    tooltip="Données météo Open-Meteo. "
                    margin={{top: 1, right: 0, left: -25, bottom: -10}}
                    series={[
                        {
                            type: CHART_TYPE.AREA,
                            key: 'shortwaveRadiation',
                            label: 'Global',
                            color: '#f97316',
                            unit: 'W/m²',
                        },
                        {
                            type: CHART_TYPE.LINE,
                            key: 'diffuseRadiation',
                            label: 'Diffus',
                            color: '#fbbf24',
                            unit: 'W/m²',
                        },
                    ]}
                />
                <Chart
                    data={
                        predictionsData?.hourly.map((hour) => ({
                            timestamp: formatDate(new Date(hour.timestamp), 'HH:mm'),
                            temperature: hour.weather.temperature,
                        })) ?? []
                    }
                    xKey="timestamp"
                    title="Température"
                    tooltip="Données météo Open-Meteo. "
                    margin={{top: 1, right: 0, left: -35, bottom: -10}}
                    series={[
                        {
                            type: CHART_TYPE.AREA,
                            key: 'temperature',
                            label: 'Température',
                            color: '#ef4444',
                            unit: '°C',
                        },
                    ]}
                />
                <Chart
                    data={
                        predictionsData?.hourly.map((hour) => ({
                            timestamp: formatDate(new Date(hour.timestamp), 'HH:mm'),
                            cloudCover: hour.weather.cloud_cover,
                            relativeHumidity: hour.weather.relative_humidity,
                        })) ?? []
                    }
                    xKey="timestamp"
                    title="Autre Variables"
                    tooltip="Données météo Open-Meteo. "
                    margin={{top: 1, right: 0, left: -30, bottom: -10}}
                    series={[
                        {
                            type: CHART_TYPE.LINE,
                            key: 'cloudCover',
                            label: 'Nébulosité',
                            color: '#94a3b8',
                            unit: '%',
                        },
                        {
                            type: CHART_TYPE.LINE,
                            key: 'relativeHumidity',
                            label: 'Humidité',
                            color: '#3b82f6',
                            unit: '%',
                        },
                    ]}
                />
            </div>
        </main>
    );
}

export default Overview;
