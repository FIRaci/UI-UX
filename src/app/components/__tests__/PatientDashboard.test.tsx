import { render, screen, fireEvent } from '@testing-library/react';
import { PatientDashboard } from '../PatientDashboard';

beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no network')));
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('PatientDashboard', () => {
  it('renders the PatientDashboard tabs: "Tổng quan", "Bác sĩ", "Cuộc hẹn"', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    expect(screen.getByText('Tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Tìm bác sĩ')).toBeInTheDocument();
    expect(screen.getByText('Lịch hẹn của tôi')).toBeInTheDocument();
  });

  it('first tab ("Tổng quan") is active by default', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    expect(screen.getByText('Hành động nhanh')).toBeInTheDocument();
    const overviewBtn = screen.getByText('Tổng quan').closest('button');
    expect(overviewBtn).toHaveStyle(
      'background: linear-gradient(135deg, #3B82F6, #2563EB)'
    );
  });

  it('clicking "Lịch hẹn" tab changes active tab', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    fireEvent.click(screen.getByText('Lịch hẹn của tôi'));
    expect(screen.getByText('Sắp tới')).toBeInTheDocument();
  });

  it('main dashboard wrapper renders with patient-related content', () => {
    render(<PatientDashboard onLogout={vi.fn()} role="patient" />);
    expect(screen.getByText('Bảng điều khiển')).toBeInTheDocument();
    const roleElements = screen.getAllByText('Bệnh nhân');
    expect(roleElements.length).toBe(2);
    expect(screen.getByText(/Xin chào/)).toBeInTheDocument();
  });
});
