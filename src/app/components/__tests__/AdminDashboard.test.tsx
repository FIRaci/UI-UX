import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDashboard } from '../AdminDashboard';

describe('AdminDashboard', () => {
  it('renders all navigation tabs', () => {
    render(<AdminDashboard onLogout={() => {}} role="admin" />);

    const overviewTexts = screen.getAllByText('Tổng quan');
    expect(overviewTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Quản lý bệnh nhân')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo & thống kê')).toBeInTheDocument();
    expect(screen.getByText('Lịch khám hệ thống')).toBeInTheDocument();
    expect(screen.getByText('Chat AI')).toBeInTheDocument();
    expect(screen.getByText('Thông báo')).toBeInTheDocument();
    expect(screen.getByText('Lịch làm việc BS')).toBeInTheDocument();
  });

  it('shows overview tab content by default', () => {
    render(<AdminDashboard onLogout={() => {}} role="admin" />);

    expect(screen.getByText('Doanh thu tháng')).toBeInTheDocument();
    const metrics = screen.getAllByText('380M');
    expect(metrics.length).toBeGreaterThan(0);
    expect(screen.getByText('Lượt khám tuần')).toBeInTheDocument();
    expect(screen.getByText('945')).toBeInTheDocument();
  });

  it('switches to reports tab when "Báo cáo & thống kê" is clicked', () => {
    render(<AdminDashboard onLogout={() => {}} role="admin" />);

    fireEvent.click(screen.getByText('Báo cáo & thống kê'));

    expect(screen.getByText('Loại báo cáo')).toBeInTheDocument();
    expect(screen.queryByText('Doanh thu tháng')).not.toBeInTheDocument();
  });

  it('renders admin-specific metrics in overview', () => {
    render(<AdminDashboard onLogout={() => {}} role="admin" />);

    expect(screen.getByText('Bệnh nhân mới')).toBeInTheDocument();
    expect(screen.getByText('12,840')).toBeInTheDocument();
    expect(screen.getByText('Đội ngũ Bác sĩ')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });
});
