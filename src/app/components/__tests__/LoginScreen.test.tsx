import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginScreen } from '../LoginScreen';

// Mock matchMedia which is not present in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('LoginScreen', () => {
  it('renders all 4 roles', () => {
    render(<LoginScreen onLogin={() => {}} />);
    
    expect(screen.getByText('Tôi là Bệnh nhân')).toBeInTheDocument();
    expect(screen.getByText('Tư vấn viên')).toBeInTheDocument();
    expect(screen.getAllByText('Bác sĩ').length).toBeGreaterThan(0);
    expect(screen.getByText('Quản lý')).toBeInTheDocument();
  });

  it('shows login form inputs when manual login is clicked', () => {
    render(<LoginScreen onLogin={() => {}} />);
    
    // Click manual login button
    const manualBtn = screen.getByRole('button', { name: 'Đăng nhập bằng mật khẩu' });
    fireEvent.click(manualBtn);

    // Check if the form elements appear
    expect(screen.getByPlaceholderText('Nhập tài khoản...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });
});
