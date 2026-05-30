import { render, screen, fireEvent } from '@testing-library/react';
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
  it('renders the top navigation buttons', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    expect(screen.getByText('Tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Tìm bác sĩ')).toBeInTheDocument();
    expect(screen.getByText('Lịch hẹn')).toBeInTheDocument();
    expect(screen.getByText('Tin nhắn')).toBeInTheDocument();
  });

  it('default view is Overview', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    expect(screen.getByText(/Sức khỏe của bạn/)).toBeInTheDocument();
    expect(screen.getByText('Tổng quan Sức khỏe')).toBeInTheDocument();
  });

  it('clicking "Tìm bác sĩ" changes active view', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    fireEvent.click(screen.getByText('Tìm bác sĩ'));
    expect(screen.getByPlaceholderText('Tìm theo tên bác sĩ, chuyên khoa...')).toBeInTheDocument();
  });
});
