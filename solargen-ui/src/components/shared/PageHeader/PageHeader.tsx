import React from 'react';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
    title: string;
    children: React.ReactNode;
}

export default function PageHeader({title, children}: PageHeaderProps) {
    return (
        <section className={styles.pageHeader}>
            <h1 className={`page-title ${styles.title}`}>{title}</h1>
            {children}
        </section>
    );
}
