import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export default function ScrollToTop() {
    const {pathname} = useLocation();

    useEffect(() => {
        document.getElementById('app-layout')?.scrollTo(0, 0);
        console.log(document.getElementById('app-layout')?.scrollTop);
    }, [pathname]);

    return null;
}
