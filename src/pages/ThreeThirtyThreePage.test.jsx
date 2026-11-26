import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ThreeThirtyThreePage from './ThreeThirtyThreePage.jsx';

afterEach(cleanup);

function renderPage() {
  render(<MemoryRouter><ThreeThirtyThreePage /></MemoryRouter>);
  return userEvent.setup();
}

describe('3:33 surprise', () => {
  it('shows a clue, handles a wrong code, and accepts the keyword through keyboard submit', async () => {
    const user = renderPage();
    const input = screen.getByLabelText('ALAM MO YUNG CODE NATIN?');
    expect(screen.queryByText(/HOTEL AVA MALATE/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'PAHINGI NG CLUE' }));
    expect(screen.getByText(/A I R C O N/)).toBeVisible();
    await user.type(input, 'hello{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('ISA PANG TRY');
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, '  AIRCON  {Enter}');
    expect(screen.getByRole('heading', { name: 'DITO KA SA TABI KO.' })).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('counts distinct notes, reveals the letter, and resets the surprise when closed', async () => {
    const user = renderPage();
    await user.type(screen.getByLabelText('ALAM MO YUNG CODE NATIN?'), 'aircon{Enter}');
    await user.click(screen.getByRole('button', { name: /TAYO/ }));
    expect(screen.getByText(/HOTEL AVA MALATE/)).toBeVisible();
    expect(screen.getByText('2 / 3 LAMBING, PARA SA ’YO')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /LAPIT/ }));
    expect(screen.getByText('2 / 3 LAMBING, PARA SA ’YO')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'MAY SULAT PA ’KO' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ISA PANG LAMBING' }));
    expect(screen.getByRole('heading', { name: 'MALAMIG? MAY YAKAP AKO.' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'MAY SULAT PA ’KO' }));
    expect(screen.getByRole('heading', { name: 'ASAWAAAA KOOOO,' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'ISA PANG YAKAP' }));
    expect(screen.getByRole('heading', { name: 'DITO KA SA TABI KO.' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'ISARA MUNA' }));
    expect(screen.getByLabelText('ALAM MO YUNG CODE NATIN?')).toHaveValue('');
    expect(screen.queryByText(/HOTEL AVA MALATE/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('ALAM MO YUNG CODE NATIN?'), 'aircon{Enter}');
    expect(screen.getByText('1 / 3 LAMBING, PARA SA ’YO')).toBeVisible();
  });

  it('changes the lambing forecast within its temperature limits and resets after closing', async () => {
    const user = renderPage();
    await user.type(screen.getByLabelText('ALAM MO YUNG CODE NATIN?'), 'aircon{Enter}');
    const colder = screen.getByRole('button', { name: 'PALAMIGIN PA' });
    const warmer = screen.getByRole('button', { name: 'BAWASAN ANG LAMIG' });
    expect(warmer).toBeDisabled();
    await user.click(colder);
    expect(screen.getByLabelText('TEMPERATURA')).toHaveTextContent('20°C');
    expect(screen.getByText(/HIGH CHANCE OF CUDDLES/)).toBeVisible();
    await user.click(colder);
    expect(screen.getByLabelText('TEMPERATURA')).toHaveTextContent('16°C');
    expect(screen.getByText('YAKAP WEATHER NA ’TO!')).toBeVisible();
    expect(colder).toBeDisabled();
    await user.click(warmer);
    expect(screen.getByLabelText('TEMPERATURA')).toHaveTextContent('20°C');
    await user.click(screen.getByRole('button', { name: 'ISARA MUNA' }));
    await user.type(screen.getByLabelText('ALAM MO YUNG CODE NATIN?'), 'aircon{Enter}');
    expect(screen.getByLabelText('TEMPERATURA')).toHaveTextContent('24°C');
    expect(screen.getByRole('button', { name: 'BAWASAN ANG LAMIG' })).toBeDisabled();
  });
});
