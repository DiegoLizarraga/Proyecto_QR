import { render, screen } from '@testing-library/react';
import App from './App';

test('renders scanner button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Escáner/i);
  expect(buttonElement).toBeInTheDocument();
});
