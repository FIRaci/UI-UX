import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatView } from '../ChatView';

describe('ChatView', () => {
  const originalFetch = globalThis.fetch;
  beforeAll(() => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('AI service offline'));
  });
  afterAll(() => {
    globalThis.fetch = originalFetch;
  });
  it('renders welcome message based on role', () => {
    render(<ChatView role="benhnhan" />);
    expect(
      screen.getByText(/Xin chào! Tôi là trợ lý sức khỏe AI/),
    ).toBeInTheDocument();
  });

  it('renders suggestion prompt chips', () => {
    render(<ChatView role="benhnhan" />);
    expect(screen.getByText('Tôi bị đau đầu')).toBeInTheDocument();
    expect(screen.getByText('Tôi bị sốt')).toBeInTheDocument();
    expect(screen.getByText('Tôi bị đau bụng')).toBeInTheDocument();
    expect(screen.getByText('Tôi mệt mỏi')).toBeInTheDocument();
  });

  it('can type a message in textarea', () => {
    render(<ChatView role="benhnhan" />);
    const textarea = screen.getByPlaceholderText('Nhap tin nhan...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Tôi bị đau đầu' } });
    expect(textarea.value).toBe('Tôi bị đau đầu');
  });

  it('shows medical disclaimer', () => {
    render(<ChatView role="benhnhan" />);
    expect(screen.getByText(/Ket qua AI chi mang tinh ho tro/)).toBeInTheDocument();
  });

  it('different roles show different welcome text', () => {
    render(<ChatView role="quanly" />);
    expect(
      screen.getByText(/Tôi có thể giúp bạn xem báo cáo vận hành/),
    ).toBeInTheDocument();
    render(<ChatView role="bacsi" />);
    expect(screen.getByText(/Xin chào bác sĩ/)).toBeInTheDocument();
  });

  it('clicking a suggestion chip sends that message', async () => {
    render(<ChatView role="benhnhan" />);
    fireEvent.click(screen.getByText('Tôi bị đau đầu'));
    expect(screen.getByText('Tôi bị đau đầu')).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByText(/Đau đầu có thể do nhiều nguyên nhân/)).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });
});
