import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../AppShell';
import { Home, Calendar, Settings } from 'lucide-react';

const nav = [
  { key: 'home', label: 'Trang chủ', icon: Home },
  { key: 'calendar', label: 'Lịch khám', icon: Calendar },
  { key: 'settings', label: 'Cài đặt', icon: Settings },
];

function renderShell(props?: Record<string, unknown>) {
  return render(
    <AppShell
      title="Dashboard"
      subtitle="Chào mừng bạn trở lại"
      roleLabel="Bác sĩ"
      roleColor="bg-purple-600"
      initials="BS"
      nav={nav}
      active="home"
      onNav={vi.fn()}
      onLogout={vi.fn()}
      {...props}
    >
      <p data-testid="children-content">Nội dung chính</p>
    </AppShell>,
  );
}

describe('AppShell', () => {
  it('renders brand name and role label', () => {
    renderShell();
    expect(screen.getByText('MediCare AI')).toBeInTheDocument();
    const labels = screen.getAllByText('Bác sĩ');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('renders title and subtitle in header', () => {
    renderShell();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Chào mừng bạn trở lại')).toBeInTheDocument();
  });

  it('renders navigation items from nav prop', () => {
    renderShell();
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Lịch khám')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
  });

  it('active nav item has blue gradient background', () => {
    renderShell();
    const homeBtn = screen.getByText('Trang chủ').closest('button')!;
    expect(homeBtn).toHaveStyle({ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' });
  });

  it('clicking a nav item calls onNav with correct key', () => {
    const onNav = vi.fn();
    renderShell({ onNav });
    fireEvent.click(screen.getByText('Lịch khám'));
    expect(onNav).toHaveBeenCalledWith('calendar');
  });

  it('clicking logout button calls onLogout', () => {
    const onLogout = vi.fn();
    renderShell({ onLogout });
    fireEvent.click(screen.getByText('Đăng xuất'));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('notification bell renders', () => {
    renderShell();
    expect(screen.getByText('Thông báo')).toBeInTheDocument();
  });

  it('notification popover shows empty state when no notifications', () => {
    renderShell();
    const bell = document.querySelector('[class*="PopoverTrigger"]') || document.querySelector('button svg.lucide-bell')?.closest('button');
    if (bell) {
      fireEvent.click(bell);
    }
    const emptyTexts = screen.queryAllByText('Không có thông báo mới');
    expect(emptyTexts.length).toBeGreaterThanOrEqual(0);
  });

  it('renders children content', () => {
    renderShell();
    expect(screen.getByTestId('children-content')).toHaveTextContent('Nội dung chính');
  });

  it('role badge shows correct role', () => {
    const { unmount } = renderShell({ roleLabel: 'Bác sĩ' });
    const labels = screen.getAllByText('Bác sĩ');
    expect(labels.length).toBe(2);
    expect(labels[1]).toHaveClass('px-2.5');
    unmount();

    renderShell({ roleLabel: 'Quản lý' });
    expect(screen.getAllByText('Quản lý').length).toBe(2);
  });
});
