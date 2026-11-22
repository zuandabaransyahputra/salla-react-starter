import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...props }: { to: string; children?: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const { ExampleBanner } = await import('../../../app/components/home');

describe('ExampleBanner', () => {
  it('renders nothing without a title or description', () => {
    const { container } = render(<ExampleBanner data={{}} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the button only when both its text and link are set', () => {
    const { rerender } = render(
      <ExampleBanner data={{ title: 'مرحباً', button_text: 'تسوق الآن' }} />
    );
    expect(screen.getByRole('heading', { name: 'مرحباً' })).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();

    rerender(
      <ExampleBanner data={{ title: 'مرحباً', button_text: 'تسوق الآن', button_url: '/offers' }} />
    );
    expect(screen.getByRole('link', { name: 'تسوق الآن' }).getAttribute('href')).toBe('/offers');
  });
});
