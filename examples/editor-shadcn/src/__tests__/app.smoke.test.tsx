import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '../App';

describe('App smoke test', () => {
  it('renderizza shell e dashboard', () => {
    render(<App />);
    // Header: nome prodotto e ricerca
    expect(screen.getAllByText('Email Builder').length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Cerca template...')).toBeTruthy();
    // Sidebar: voci di menu in italiano (lingua default)
    expect(screen.getAllByText('Template prefatti').length).toBeGreaterThan(0);
    expect(screen.getByText('I miei template')).toBeTruthy();
    expect(screen.getByText('Esportazioni')).toBeTruthy();
    // Powered by
    expect(screen.getByText('Powered by')).toBeTruthy();
    // Dashboard attiva di default
    expect(screen.getByText('Panoramica del tuo email builder.')).toBeTruthy();
  });
});
