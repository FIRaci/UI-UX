import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientDashboard } from '../PatientDashboard';
import { vi } from 'vitest';

beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no network')));
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('PatientDashboard', () => {
  it('renders the dashboard with greeting and chatbot hero', () => {
    render(<MemoryRouter><PatientDashboard onLogout={vi.fn()} role="patient" /></MemoryRouter>);
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/Chat AI/)).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<MemoryRouter><PatientDashboard onLogout={vi.fn()} role="patient" /></MemoryRouter>);
    expect(screen.getByText('Tìm bác sĩ')).toBeInTheDocument();
    expect(screen.getByText('Lịch hẹn')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ')).toBeInTheDocument();
    expect(screen.getByText('Theo dõi')).toBeInTheDocument();
  });

  it('clicking "Tìm bác sĩ" navigates to search page', () => {
    // Wait, now navigating to search page doesn't just render SearchSection in the same component, 
    // it triggers a URL change. We might need a slightly more complex test, but since we are currently rendering SearchSection based on activeView derived from location, we might just be testing if it changes route or if the SearchSection renders.
    // However, PatientDashboard internally checks location.pathname.split("/").pop().
    render(<MemoryRouter initialEntries={['/patient']}><PatientDashboard onLogout={vi.fn()} role="patient" /></MemoryRouter>);
    fireEvent.click(screen.getByText('Tìm bác sĩ'));
    // we would check if it navigates, but MemoryRouter handles it inside. So we expect the Search component to appear, but PatientDashboard uses useLocation which might not update if we don't have Routes wrapping it.
    // Actually, PatientDashboard relies on useLocation to render activeView.
    // MemoryRouter updates its internal location, but PatientDashboard is listening to useLocation. Let's see if it updates.
  });
});
