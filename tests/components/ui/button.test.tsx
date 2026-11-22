import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, buttonVariants } from '../../../app/components/ui';

describe('Button', () => {
  it('is type="button" unless told otherwise', () => {
    render(
      <>
        <Button>One</Button>
        <Button type="submit">Two</Button>
      </>
    );
    expect(screen.getByText('One').getAttribute('type')).toBe('button');
    expect(screen.getByText('Two').getAttribute('type')).toBe('submit');
  });

  it('renders the child element with the button styles (asChild)', () => {
    render(
      <Button asChild variant="outline">
        <a href="/offers">Offers</a>
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Offers' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('type')).toBeNull();
    expect(link.className).toContain('border-ink');
  });

  it('lets a caller override a default utility', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-10');
    render(<Button className="h-14">Tall</Button>);
    const cls = screen.getByText('Tall').className;
    expect(cls).toContain('h-14');
    expect(cls).not.toContain('h-12');
  });
});
