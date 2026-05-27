import { render, screen, fireEvent } from '@testing-library/react';
import { DoctorDashboard } from '../DoctorDashboard';

describe('DoctorDashboard', () => {
  it('renders navigation tabs', () => {
    render(<DoctorDashboard onLogout={vi.fn()} role="bacsi" />);
    expect(screen.getByText('Tổng quan & Ca chờ')).toBeInTheDocument();
    expect(screen.getByText('Lịch khám hôm nay')).toBeInTheDocument();
  });

  it('renders unique nav labels that do not conflict with content', () => {
    render(<DoctorDashboard onLogout={vi.fn()} role="bacsi" />);
    expect(screen.getByText('Chat AI')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ & đơn thuốc')).toBeInTheDocument();
    expect(screen.getByText('Tin nhắn tư vấn')).toBeInTheDocument();
  });

  it('default tab shows overview content', () => {
    render(<DoctorDashboard onLogout={vi.fn()} role="bacsi" />);
    const overviewBtn = screen.getByText('Tổng quan & Ca chờ').closest('button')!;
    expect(overviewBtn).toHaveStyle({ fontWeight: 600 });
  });

  it('clicking Chat AI tab shows chat view', () => {
    render(<DoctorDashboard onLogout={vi.fn()} role="bacsi" />);
    fireEvent.click(screen.getByText('Chat AI'));
    expect(screen.getByText(/Xin chào bác sĩ/)).toBeInTheDocument();
  });

  it('renders doctor name in subtitle', () => {
    render(<DoctorDashboard onLogout={vi.fn()} role="bacsi" />);
    expect(screen.getByText(/Chào/)).toBeInTheDocument();
  });
});
