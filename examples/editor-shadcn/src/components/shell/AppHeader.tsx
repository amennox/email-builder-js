import { useMemo, useState } from 'react';

import { Bell, ChevronDown, KeyRound, Languages, LogOut, Search, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { setLocale, useLocale } from '@/documents/editor/EditorContext';
import { useT } from '@/lib/i18n';
import { searchTemplates, useMyTemplates } from '@/templates/templateStore';
import { PREFAB_TEMPLATES } from '@/templates/prefabs';

import { openTemplate } from './navigation';

// Utente fittizio: la parte di autenticazione è un placeholder visivo.
const DEMO_USER = {
  name: 'Andrea Menozzi',
  email: 'a.menozzi@strategicamente.tech',
  initials: 'AM',
};

const SIDEBAR_WIDTH_CLASS = 'w-64';

function LogoZone() {
  const t = useT();
  return (
    <div
      className={`${SIDEBAR_WIDTH_CLASS} flex h-full shrink-0 items-center gap-2.5 px-4`}
      style={{ backgroundImage: 'linear-gradient(to right, rgba(24, 24, 27, 0.05), rgba(0, 0, 0, 0))' }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-base font-bold text-background">
        E
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold">{t('app.name')}</div>
        <div className="text-[10px] tracking-wider text-muted-foreground uppercase">{t('app.beta')}</div>
      </div>
    </div>
  );
}

function TemplateSearch() {
  const t = useT();
  const [query, setQuery] = useState('');
  // sottoscrizione: i risultati si aggiornano quando cambiano i template salvati
  useMyTemplates();
  const results = useMemo(() => searchTemplates(query, PREFAB_TEMPLATES), [query]);
  const open = query.trim().length >= 2;

  const handleSelect = (kind: 'prefab' | 'saved', id: string) => {
    setQuery('');
    openTemplate(kind, id);
  };

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder={t('header.searchPlaceholder')}
            className="rounded-full border-transparent bg-muted/50 pl-9 focus-visible:bg-background"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-72 p-1"
        align="start"
        onOpenAutoFocus={(ev) => ev.preventDefault()}
      >
        {results.length === 0 ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">{t('header.searchNoResults')}</p>
        ) : (
          results.map((r) => (
            <button
              key={`${r.kind}-${r.id}`}
              type="button"
              className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
              onClick={() => handleSelect(r.kind, r.id)}
            >
              <span>{r.name}</span>
              <span className="text-xs text-muted-foreground">
                {r.kind === 'prefab' ? t('nav.prefabTemplates') : t('nav.myTemplates')}
              </span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}

function LanguageSelector() {
  const t = useT();
  const locale = useLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1.5 px-2">
          <Languages />
          <span className="text-sm uppercase">{locale}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('header.language')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLocale('it')}>
          🇮🇹 {t('header.language.it')}
          {locale === 'it' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('en')}>
          🇬🇧 {t('header.language.en')}
          {locale === 'en' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen((v) => !v)}>
          <Bell />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          <span className="sr-only">{t('header.notifications')}</span>
        </Button>
      </PopoverAnchor>
      <PopoverContent align="end" className="w-56">
        <p className="text-sm text-muted-foreground">{t('header.noNotifications')}</p>
      </PopoverContent>
    </Popover>
  );
}

function UserMenu() {
  const t = useT();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-12 gap-2.5 px-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
              {DEMO_USER.initials}
            </div>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-sm font-medium">{DEMO_USER.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{DEMO_USER.email}</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
            <UserRound />
            {t('user.profile')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => toast.success(t('user.loggedOut'))}>
            <LogOut />
            {t('user.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4" />
              {t('user.changePassword')}
            </DialogTitle>
            <DialogDescription>{DEMO_USER.email}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              setPasswordDialogOpen(false);
              toast.success(t('user.passwordChanged'));
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('user.currentPassword')}</Label>
              <Input id="current-password" type="password" autoComplete="current-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t('user.newPassword')}</Label>
              <Input id="new-password" type="password" autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('user.confirmPassword')}</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" />
            </div>
            <DialogFooter>
              <Button type="submit">{t('user.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-background">
      <LogoZone />
      <div className="flex flex-1 items-center gap-3 px-4">
        <TemplateSearch />
        <div className="ml-auto flex items-center gap-1">
          <LanguageSelector />
          <Notifications />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
