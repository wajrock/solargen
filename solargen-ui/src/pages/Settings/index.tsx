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
                            to={'https://github.com/CDAC-lab/UNISOLAR'}
                            target="_blank"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path
                                    fill="var(--primary-text-color)"
                                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
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
                                    fill="#EA580C"
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
