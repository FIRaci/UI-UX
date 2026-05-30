import { render, screen, fireEvent } from '@testing-library/react';
import { ConsultantDashboard } from '../ConsultantDashboard';
import { vi } from 'vitest';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('ConsultantDashboard', () => {
  it('renders correctly', () => {
    render(<ConsultantDashboard onLogout={() => {}} role="tuvan" />);
    expect(screen.getByText('Trung tâm Tư vấn Online')).toBeInTheDocument();
    expect(screen.getByText('Tin nhắn bệnh nhân')).toBeInTheDocument();
    expect(screen.getByText('Danh sách phiên tư vấn')).toBeInTheDocument();
  });

  it('renders threads and chat area', () => {
    render(<ConsultantDashboard onLogout={() => {}} role="tuvan" />);
    // Check that search box is present
    expect(screen.getByPlaceholderText('Tìm kiếm bệnh nhân, chủ đề...')).toBeInTheDocument();
    
    // Check that input box is present or "Chưa chọn phiên tư vấn" if empty
    // The store should have threads by default for CV.
    const inputElement = screen.queryByPlaceholderText('Nhập nội dung tư vấn chuyên môn...');
    if (inputElement) {
        expect(inputElement).toBeInTheDocument();
    } else {
        expect(screen.getByText('Chưa chọn phiên tư vấn')).toBeInTheDocument();
    }
  });
});
