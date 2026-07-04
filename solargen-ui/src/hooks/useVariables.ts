import {useEffect, useState} from 'react';

function useVariables() {
    const [co2Rate, setCo2Rate] = useState<number>(() => {
        const savedCo2Rate = localStorage.getItem('co2-rate');
        if (savedCo2Rate) return parseFloat(savedCo2Rate);
        return 0.82;
    });

    const [electricRate, setElectricRate] = useState<number>(() => {
        const savedElectricRate = localStorage.getItem('electric-rate');
        if (savedElectricRate) return parseFloat(savedElectricRate);
        return 0.348;
    });

    useEffect(() => {
        localStorage.setItem('co2-rate', JSON.stringify(co2Rate));
    }, [co2Rate]);

    useEffect(() => {
        localStorage.setItem('electric-rate', JSON.stringify(electricRate));
    }, [electricRate]);

    return {co2Rate, electricRate, setCo2Rate, setElectricRate};
}

export default useVariables;
