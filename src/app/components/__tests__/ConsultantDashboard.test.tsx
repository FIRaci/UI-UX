import { render, screen, fireEvent } from '@testing-library/react';
import { ConsultantDashboard } from '../ConsultantDashboard';

describe('ConsultantDashboard', () => {
  it('renders all navigation tabs', () => {
    render(<ConsultantDashboard onLogout={() => {}} role="consultant" />);

    expect(screen.getByText('Tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Tư vấn AI')).toBeInTheDocument();
    const doctorNav = screen.getAllByText('Bác sĩ được gợi ý');
    expect(doctorNav.length).toBeGreaterThan(0);
    expect(screen.getByText('Đặt lịch khám')).toBeInTheDocument();
    expect(screen.getByText('Lịch sử tư vấn')).toBeInTheDocument();
    expect(screen.getByText('Thư viện')).toBeInTheDocument();
  });

  it('shows dashboard tab content by default', () => {
    render(<ConsultantDashboard onLogout={() => {}} role="consultant" />);

    expect(screen.getByText('Bắt đầu tư vấn AI')).toBeInTheDocument();
    expect(screen.getByText('Cảm thấy không khỏe?')).toBeInTheDocument();
  });

  it('switches to AI Chat tab when "Tư vấn AI" is clicked', () => {
    render(<ConsultantDashboard onLogout={() => {}} role="consultant" />);

    fireEvent.click(screen.getByText('Tư vấn AI'));

    expect(screen.getByPlaceholderText('Mô tả triệu chứng của bạn...')).toBeInTheDocument();
    expect(screen.queryByText('Bắt đầu tư vấn AI')).not.toBeInTheDocument();
  });

  it('renders "Trợ lý sức khỏe AI" header text on dashboard', () => {
    render(<ConsultantDashboard onLogout={() => {}} role="consultant" />);

    const headers = screen.getAllByText('Trợ lý sức khỏe AI');
    expect(headers.length).toBeGreaterThan(0);
  });
});
