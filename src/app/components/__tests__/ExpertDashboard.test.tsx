import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpertDashboard } from '../ExpertDashboard';

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

describe('ExpertDashboard', () => {
  it('renders heuristics checklist by default', () => {
    render(<ExpertDashboard onLogout={() => {}} />);

    expect(screen.getByText('Bảng điều khiển Kiểm thử UI/UX')).toBeInTheDocument();
    expect(screen.getByText('1. Visibility of system status (Hiển thị trạng thái hệ thống)')).toBeInTheDocument();
  });

  it('can mark a heuristic as pass', () => {
    render(<ExpertDashboard onLogout={() => {}} />);

    const passButtons = screen.getAllByText('Đạt');
    expect(passButtons.length).toBeGreaterThan(0);

    fireEvent.click(passButtons[0]);

    expect(passButtons[0]).toHaveClass('bg-emerald-500');
  });
});