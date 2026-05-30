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
    
    expect(screen.getByText('Người cần khám bệnh')).toBeInTheDocument();
    expect(screen.getByText('Người cần tư vấn')).toBeInTheDocument();
    expect(screen.getAllByText('Bác sĩ').length).toBeGreaterThan(0);
    expect(screen.getByText('Quản lý phòng khám')).toBeInTheDocument();
  });

  it('shows login form inputs', () => {
    render(<LoginScreen onLogin={() => {}} />);
    
    // Check if the form elements appear
    expect(screen.getByPlaceholderText('benhnhan / bacsi / quanly...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đăng nhập hệ thống' })).toBeInTheDocument();
  });
});
