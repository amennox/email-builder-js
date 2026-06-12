import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import AiTextActions from '@/ai/AiTextActions';
import TextSidebarPanel from '@/components/editor/inspector/input-panels/TextSidebarPanel';

describe('AiTextActions', () => {
  it('standalone: il menu si apre', async () => {
    const user = userEvent.setup();
    render(<AiTextActions getText={() => 'ciao'} onApply={() => {}} />);
    await user.click(screen.getByTitle('AI'));
    expect(await screen.findByText('Migliora')).toBeTruthy();
  });

  it('dentro TextSidebarPanel: il menu si apre', async () => {
    const user = userEvent.setup();
    render(<TextSidebarPanel data={{ props: { text: 'ciao' } }} setData={() => {}} />);
    await user.click(screen.getByTitle('AI'));
    expect(await screen.findByText('Migliora')).toBeTruthy();
  });
});
