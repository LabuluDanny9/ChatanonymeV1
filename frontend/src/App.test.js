import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ChatAnonyme app', async () => {
  render(<App />);
  const heading = await screen.findByText(/ChatAnonyme/i);
  expect(heading).toBeInTheDocument();
});
