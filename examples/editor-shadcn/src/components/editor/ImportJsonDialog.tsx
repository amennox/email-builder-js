import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { resetDocument, setSelectedMainTab } from '@/documents/editor/EditorContext';
import validateJsonStringValue from '@/documents/editor/validateJsonStringValue';
import { useT } from '@/lib/i18n';

type ImportJsonDialogProps = {
  onClose: () => void;
};

export default function ImportJsonDialog({ onClose }: ImportJsonDialogProps) {
  const t = useT();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (v: string) => {
    setValue(v);
    const { error } = validateJsonStringValue(v);
    setError(v.trim() ? (error ?? null) : null);
  };

  const handleSubmit = () => {
    const { error, data } = validateJsonStringValue(value);
    setError(error ?? null);
    if (!data) {
      return;
    }
    resetDocument(data);
    setSelectedMainTab('editor');
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editor.importJson.title')}</DialogTitle>
          <DialogDescription>{t('editor.importJson.description')}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(ev) => {
            ev.preventDefault();
            handleSubmit();
          }}
        >
          <Textarea
            rows={10}
            value={value}
            onChange={(ev) => handleChange(ev.target.value)}
            className="font-mono text-xs"
            aria-invalid={error !== null}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{t('editor.importJson.error')}</p>}
          <DialogFooter>
            <Button type="submit" disabled={error !== null || value.trim().length === 0}>
              {t('editor.importJson.import')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
