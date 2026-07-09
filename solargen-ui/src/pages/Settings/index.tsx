import Button from '@/components/shared/Button/Button';
import {Input} from '@/components/ui/input';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import useTheme, {THEME} from '@/pages/Settings/hooks/useTheme';
import useVariables from '@/hooks/useVariables';
import {Check, Moon, Sun} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import styles from './Settings.module.scss';
import SettingItem from './components/SettingItem';
import SettingsBlock from './components/SettingsBlock';

function Settings() {
    const {theme, setTheme} = useTheme();
    const {co2Rate, setCo2Rate, electricRate, setElectricRate} = useVariables();

    const [tempCo2Rate, setTempCo2Rate] = useState(co2Rate);
    const [showCo2RateButton, setShowCo2RateButton] = useState(false);

    const [tempElectricRate, setTempElectricRate] = useState(electricRate);
    const [showElectricRateButton, setShowElectricRateButton] = useState(false);

    useEffect(() => {
        document.title = 'Réglages | SolarGen';
    }, []);

    const handleCo2RateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(parseFloat(e.target.value).toFixed(3));
        setTempCo2Rate(value);
        setShowCo2RateButton(value !== co2Rate);
    };

    const handleCo2RateSaved = () => {
        setCo2Rate(tempCo2Rate);
        setShowCo2RateButton(false);
    };

    const handleElectricRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(parseFloat(e.target.value).toFixed(3));
        setTempElectricRate(value);
        setShowElectricRateButton(value !== electricRate);
    };

    const handleElectricRateSaved = () => {
        setElectricRate(tempElectricRate);
        setShowElectricRateButton(false);
    };

    return (
        <main className={`page ${styles.settings}`}>
            <h1 className={`page-title ${styles.title}`}>Réglages</h1>
            <section className={styles.settingsContent}>
                <SettingsBlock title="Préférences">
                    <SettingItem name={'Thème'}>
                        <Tabs value={theme} onValueChange={(val) => setTheme(val as THEME)}>
                            <TabsList className={styles.tabsList}>
                                <TabsTrigger className={styles.tabTrigger} value={THEME.LIGHT}>
                                    <Sun />
                                </TabsTrigger>
                                <TabsTrigger className={styles.tabTrigger} value={THEME.DARK}>
                                    <Moon />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </SettingItem>
                    <SettingItem name={'Taux émission CO₂ (kg/kWh)'}>
                        <div className={styles.inputGroup}>
                            <Input
                                type="number"
                                className={styles.input}
                                value={tempCo2Rate}
                                onChange={handleCo2RateChange}
                                min={0}
                                step={0.01}
                            />
                            {showCo2RateButton && (
                                <Button
                                    className={styles.inputButton}
                                    onClick={handleCo2RateSaved}
                                    disabled={!tempCo2Rate || tempCo2Rate < 0}
                                    title={!tempCo2Rate || tempCo2Rate < 0 ? 'Entrez une valeur correcte.' : ''}
                                >
                                    <Check />
                                </Button>
                            )}
                        </div>
                    </SettingItem>
                    <SettingItem name={'Tarif électrique (AUD/kWh)'}>
                        <div className={styles.inputGroup}>
                            <Input
                                type="number"
                                className={styles.input}
                                value={tempElectricRate}
                                onChange={handleElectricRateChange}
                                min={0}
                                step={0.01}
                            />
                            {showElectricRateButton && (
                                <Button
                                    className={styles.inputButton}
                                    onClick={handleElectricRateSaved}
                                    disabled={!tempElectricRate || tempElectricRate < 0}
                                    title={
                                        !tempElectricRate || tempElectricRate < 0 ? 'Entrez une valeur correcte.' : ''
                                    }
                                >
                                    <Check />
                                </Button>
                            )}
                        </div>
                    </SettingItem>
                </SettingsBlock>

                <SettingsBlock title="Ressources">
                    <SettingItem name={'Jeu de données'}>
                        <Link
                            className={styles.ressourceLink}
                            to={'https://www.kaggle.com/datasets/cdaclab/unisolar'}
                            target="_blank"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 163 63.2">
                                <path
                                    fill="currentColor"
                                    d="M26.92 47c-.05.18-.24.27-.56.27h-6.17a1.24 1.24 0 0 1-1-.48L9 33.78l-2.83 2.71v10.06a.61.61 0 0 1-.69.69H.69a.61.61 0 0 1-.69-.69V.69A.61.61 0 0 1 .69 0h4.79a.61.61 0 0 1 .69.69v28.24l12.21-12.35a1.44 1.44 0 0 1 1-.49h6.39a.54.54 0 0 1 .55.35.59.59 0 0 1-.07.63L13.32 29.55l13.46 16.72a.65.65 0 0 1 .14.73ZM51.93 47.24h-4.79c-.51 0-.76-.23-.76-.69v-1a12.77 12.77 0 0 1-7.84 2.29A11.28 11.28 0 0 1 31 45.16a9 9 0 0 1-3.12-7.07q0-6.81 8.46-9.23a61.55 61.55 0 0 1 10.06-1.67A5.47 5.47 0 0 0 40.48 21a14 14 0 0 0-7.91 2.77c-.41.24-.71.19-.9-.13l-2.5-3.54c-.23-.28-.16-.6.21-1a19.32 19.32 0 0 1 11.1-3.68A13.29 13.29 0 0 1 48 17.55q4.59 3.06 4.58 9.78v19.22a.61.61 0 0 1-.65.69Zm-5.55-14.5q-6.8.7-9.3 1.81Q33.69 36 34 38.71a3.49 3.49 0 0 0 1.53 2.46 5.87 5.87 0 0 0 3 1.08 9.49 9.49 0 0 0 7.77-2.57ZM81 59.28q-3.81 3.92-10.74 3.92a15.41 15.41 0 0 1-7.63-2c-.51-.33-1.11-.76-1.81-1.29s-1.5-1.19-2.43-2a.72.72 0 0 1-.07-1l3.26-3.26a.76.76 0 0 1 .56-.21.68.68 0 0 1 .49.21c2.58 2.58 5.11 3.88 7.56 3.88q8.39 0 8.39-8.74v-3.63a13.1 13.1 0 0 1-8.67 2.71 12.48 12.48 0 0 1-10.55-5.07A18.16 18.16 0 0 1 56 31.63a18 18 0 0 1 3.2-10.82 12.19 12.19 0 0 1 10.61-5.34 13.93 13.93 0 0 1 8.74 2.71v-1.39a.62.62 0 0 1 .69-.7h4.79a.62.62 0 0 1 .7.7v31q.03 7.57-3.73 11.49ZM78.58 26q-1.74-4.44-8-4.44-8.11 0-8.11 10.12 0 5.63 2.7 8.19a7.05 7.05 0 0 0 5.21 2q6.51 0 8.25-4.44ZM113.59 59.28q-3.78 3.91-10.72 3.92a15.44 15.44 0 0 1-7.63-2q-.76-.49-1.8-1.29c-.7-.53-1.51-1.19-2.43-2a.7.7 0 0 1-.07-1l3.26-3.26a.74.74 0 0 1 .55-.21.67.67 0 0 1 .49.21c2.59 2.58 5.11 3.88 7.56 3.88q8.4 0 8.4-8.74v-3.63a13.14 13.14 0 0 1-8.68 2.71A12.46 12.46 0 0 1 92 42.8a18.09 18.09 0 0 1-3.33-11.17 18 18 0 0 1 3.19-10.82 12.21 12.21 0 0 1 10.61-5.34 14 14 0 0 1 8.75 2.71v-1.39a.62.62 0 0 1 .69-.7h4.79a.62.62 0 0 1 .69.7v31q-.02 7.57-3.8 11.49ZM111.2 26q-1.74-4.44-8-4.44-8.2-.05-8.2 10.07 0 5.63 2.71 8.19a7 7 0 0 0 5.2 2q6.53 0 8.26-4.44ZM128 47.24h-4.78a.62.62 0 0 1-.7-.69V.69a.62.62 0 0 1 .7-.69H128a.61.61 0 0 1 .7.69v45.86a.61.61 0 0 1-.7.69ZM162.91 33.16a.62.62 0 0 1-.7.69h-22.54a8.87 8.87 0 0 0 2.91 5.69 10.63 10.63 0 0 0 7.15 2.46 11.64 11.64 0 0 0 6.86-2.15c.42-.28.77-.28 1 0l3.26 3.33c.37.37.37.69 0 1a18.76 18.76 0 0 1-11.58 3.75 16 16 0 0 1-11.8-4.72 16.2 16.2 0 0 1-4.57-11.86 16 16 0 0 1 4.51-11.52 14.36 14.36 0 0 1 10.82-4.3A14.07 14.07 0 0 1 158.88 20 15 15 0 0 1 163 31.63ZM153.82 23a8.18 8.18 0 0 0-5.69-2.15 8.06 8.06 0 0 0-5.48 2.08 9.24 9.24 0 0 0-3 5.41h16.71a7 7 0 0 0-2.54-5.34Z"
                                />
                            </svg>
                            <span>UNISOLAR</span>
                        </Link>
                    </SettingItem>
                    <SettingItem name={'Documentation API'}>
                        <Link
                            className={styles.ressourceLink}
                            to={'https://api--solargen-backend--mdh6jkptypjr.code.run'}
                            target="_blank"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" fill="none">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.47093 0L6.59146 6.95166L0.254696 9.57643L2.87947 15.9132L0 22.8649L6.95166 25.7443L9.57643 32.0811L15.9132 29.4563L22.8649 32.3358L25.7443 25.3841L32.0811 22.7594L29.4563 16.4226L32.3358 9.47093L25.3841 6.59146L22.7594 0.254695L16.4226 2.87947L9.47093 0ZM11.4686 4.82282L16.422 6.87456L20.7619 5.07688L22.5596 9.41687L27.513 11.4686L25.4612 16.422L27.2589 20.7619L22.9189 22.5596L20.8672 27.513L15.9138 25.4612L11.5738 27.2589L9.77616 22.9189L4.82282 20.8672L6.87456 15.9138L5.07688 11.5738L9.41687 9.77616L11.4686 4.82282ZM18.4277 21.6236C19.8746 21.0242 21.0242 19.8746 21.6236 18.4277C22.2229 16.9808 22.2229 15.355 21.6236 13.9081C21.0242 12.4611 19.8746 11.3116 18.4277 10.7122C16.9808 10.1129 15.355 10.1129 13.9081 10.7122C12.4611 11.3116 11.3116 12.4611 10.7122 13.9081C10.1129 15.355 10.1129 16.9808 10.7122 18.4277C11.3116 19.8746 12.4611 21.0242 13.9081 21.6236C15.355 22.2229 16.9808 22.2229 18.4277 21.6236Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span>SolarGen API</span>
                        </Link>
                    </SettingItem>
                </SettingsBlock>
            </section>
        </main>
    );
}

export default Settings;
