import { render } from '@testing-library/react';
import { test, vi } from 'vitest';
import App from './App.jsx';

// --- MOCKS ---

// Mock external libraries
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Navigate: () => <div>Navigated</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  Outlet: () => <div>Outlet Mock</div>,
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
}));

vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div>Speed Insights Mock</div>,
}));

// Mock application services
vi.mock('./services/api', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('./services/adminService', () => ({
  default: {
    getDashboardStats: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// --- TEST ---

test('renders app component without crashing', () => {
  render(<App />);
});
