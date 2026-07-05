import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import PageHeader from './PageHeader';

describe('PageHeader', () => {
    it('renders the title and children', () => {
        render(
            <PageHeader title="Modèle ML">
                <p>Contenu additionnel</p>
            </PageHeader>,
        );

        expect(screen.getByText('Modèle ML')).toBeInTheDocument();
        expect(screen.getByText('Contenu additionnel')).toBeInTheDocument();
    });
});
