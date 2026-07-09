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
import {getMelbourneToday, isSameDay} from '@/utils/date';
import StateMessage from '@/components/shared/StateMessage/StateMessage';
import {AlertCircle, Clock} from 'lucide-react';

function Overview() {
    const {date, siteId, handleDateChange, handleSiteChange} = useOverviewParams();

    const formatedDate = date ? formatDate(date, 'yyyy-MM-dd') : undefined;
    const {predictionsData, loading, error} = usePredictions(formatedDate, siteId);

    useEffect(() => {
        document.title = 'Tableau de bord | SolarGen';
    }, []);

    const handleRetry = () => {
        window.location.reload();
    };

    let content;
    const isToday = !date || isSameDay(date, getMelbourneToday());
    const isEmpty = !loading && predictionsData && predictionsData.hourly.length === 0;

    if (error) {
        content = (
            <StateMessage
                className={styles.alertMessage}
                icon={<AlertCircle />}
                title="Impossible de charger les données"
                description="Vérifiez votre connexion ou réessayez."
                onRetry={handleRetry}
            />
        );
    } else if (isEmpty) {
        content = (
            <StateMessage
                className={styles.alertMessage}
                icon={<Clock />}
                title={isToday ? 'Aucune prédiction disponible pour le moment' : 'Aucune donnée pour cette date'}
                description={
                    isToday
                        ? 'Les prédictions du jour seront disponibles prochainement.'
                        : "Les prédictions n'ont pas pu être générées pour ce jour."
                }
            />
        );
    } else {
        content = (
            <>
                <OverviewCards data={predictionsData} loading={loading} />
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
                    loading={loading}
                    className={styles.productionChart}
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
                        loading={loading}
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
                        loading={loading}
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
                        loading={loading}
                    />
                </div>
            </>
        );
    }

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
            {content}
        </main>
    );
}

export default Overview;
