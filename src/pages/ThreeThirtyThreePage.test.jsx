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
    const input = screen.getByLabelText('Alam mo yung code natin?');
    expect(screen.queryByText(/Hotel Ava Malate/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Pahingi ng clue' }));
    expect(screen.getByText(/A I R C O N/)).toBeVisible();
    await user.type(input, 'hello{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('Isa pang try');
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, '  AIRCON  {Enter}');
    expect(screen.getByRole('heading', { name: 'Dito ka sa tabi ko.' })).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('counts distinct notes, reveals the letter, and resets the surprise when closed', async () => {
    const user = renderPage();
    await user.type(screen.getByLabelText('Alam mo yung code natin?'), 'aircon{Enter}');
    await user.click(screen.getByRole('button', { name: /Tayo/ }));
    expect(screen.getByText(/Hotel Ava Malate/)).toBeVisible();
    expect(screen.getByText('2 / 3 LAMBING, PARA SA ’YO')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Lapit/ }));
    expect(screen.getByText('2 / 3 LAMBING, PARA SA ’YO')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'May sulat pa ’ko' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Isa pang lambing' }));
    expect(screen.getByRole('heading', { name: 'Malamig? May yakap ako.' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'May sulat pa ’ko' }));
    expect(screen.getByRole('heading', { name: 'Asawa kooo,' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Isa pang yakap' }));
    expect(screen.getByRole('heading', { name: 'Dito ka sa tabi ko.' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Isara muna' }));
    expect(screen.getByLabelText('Alam mo yung code natin?')).toHaveValue('');
    expect(screen.queryByText(/Hotel Ava Malate/)).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Alam mo yung code natin?'), 'aircon{Enter}');
    expect(screen.getByText('1 / 3 LAMBING, PARA SA ’YO')).toBeVisible();
  });
});
