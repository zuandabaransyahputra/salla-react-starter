import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../app/components/ui';

describe('Dialog', () => {
  it('renders an accessible dialog with a labelled close button', () => {
    render(
      <Dialog open>
        <DialogContent closeLabel="إغلاق">
          <DialogTitle>العنوان</DialogTitle>
          <DialogDescription>الوصف</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const dialog = screen.getByRole('dialog', { name: 'العنوان' });
    expect(screen.getByRole('button', { name: 'إغلاق' })).toBeTruthy();
    // Centred with a direction-aware translate, so it stays on screen in RTL.
    expect(dialog.className).toContain('start-1/2');
    expect(dialog.className).toContain('rtl:translate-x-1/2');
    expect(dialog.className).toContain('ltr:-translate-x-1/2');
  });
});
