import type it from './it';

const en: Record<keyof typeof it, string> = {
  // App shell
  'app.name': 'Email Builder',
  'app.beta': 'BETA',
  'header.searchPlaceholder': 'Search templates...',
  'header.searchNoResults': 'No templates found.',
  'header.notifications': 'Notifications',
  'header.noNotifications': 'No notifications.',
  'header.language': 'Language',
  'header.language.it': 'Italiano',
  'header.language.en': 'English',
  'user.profile': 'Profile',
  'user.logout': 'Log out',
  'user.changePassword': 'Change password',
  'user.currentPassword': 'Current password',
  'user.newPassword': 'New password',
  'user.confirmPassword': 'Confirm new password',
  'user.passwordChanged': 'Password updated (demo).',
  'user.loggedOut': 'Logged out (demo).',
  'user.save': 'Save',

  // Sidebar
  'nav.dashboard': 'Dashboard',
  'nav.section.emailBuilder': 'Email Builder',
  'nav.editor': 'Editor',
  'nav.prefabTemplates': 'Prebuilt templates',
  'nav.myTemplates': 'My templates',
  'nav.exports': 'Exports',
  'nav.poweredBy': 'Powered by',

  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.subtitle': 'Overview of your email builder.',
  'dashboard.myTemplatesCount': 'Personal templates',
  'dashboard.prefabCount': 'Prebuilt templates',
  'dashboard.lastSaved': 'Last saved',
  'dashboard.exportsCount': 'Exports (session)',
  'dashboard.never': 'Never',

  // Templates
  'templates.prefab.title': 'Prebuilt templates',
  'templates.prefab.subtitle': 'Ready-to-use starting points: open them or use them as a base.',
  'templates.my.title': 'My templates',
  'templates.my.subtitle': 'Templates saved in this browser.',
  'templates.new': 'New template',
  'templates.open': 'Open',
  'templates.useAsBase': 'Use as base',
  'templates.rename': 'Rename',
  'templates.duplicate': 'Duplicate',
  'templates.delete': 'Delete',
  'templates.exportZip': 'Export ZIP',
  'templates.empty.title': 'No saved templates',
  'templates.empty.subtitle': 'Create a new template or start from a prebuilt one.',
  'templates.updatedAt': 'Updated',
  'templates.deleteConfirm.title': 'Delete this template?',
  'templates.deleteConfirm.description': 'This action cannot be undone.',
  'templates.deleteConfirm.cancel': 'Cancel',
  'templates.deleteConfirm.confirm': 'Delete',
  'templates.rename.title': 'Rename template',
  'templates.rename.label': 'Name',
  'templates.rename.save': 'Save',
  'templates.copySuffix': '(copy)',
  'templates.saved': 'Template saved.',
  'templates.deleted': 'Template deleted.',
  'templates.renamed': 'Template renamed.',
  'templates.duplicated': 'Template duplicated.',
  'templates.storageError': 'Corrupted template data: storage was reset.',

  // Editor
  'editor.tab.edit': 'Edit',
  'editor.tab.preview': 'Preview',
  'editor.tab.html': 'HTML',
  'editor.tab.json': 'JSON',
  'editor.desktop': 'Desktop',
  'editor.mobile': 'Mobile',
  'editor.save': 'Save',
  'editor.export': 'Export',
  'editor.downloadJson': 'Download JSON',
  'editor.importJson': 'Import JSON',
  'editor.share': 'Share',
  'editor.shareCopied': 'Link copied to clipboard.',
  'editor.unsaved': 'Unsaved',
  'editor.untitled': 'Untitled',
  'editor.toggleInspector': 'Toggle panel',
  'editor.toggleTheme': 'Light/dark theme',
  'editor.saveAs.title': 'Save as',
  'editor.saveAs.label': 'Template name',
  'editor.saveAs.save': 'Save',
  'editor.saveAs.cancel': 'Cancel',
  'editor.unsavedChanges.title': 'Unsaved changes',
  'editor.unsavedChanges.description': 'Current changes will be lost. Continue?',
  'editor.unsavedChanges.cancel': 'Cancel',
  'editor.unsavedChanges.confirm': 'Continue without saving',
  'editor.importJson.title': 'Import JSON',
  'editor.importJson.description': 'Paste the template JSON.',
  'editor.importJson.error': 'Invalid JSON.',
  'editor.importJson.import': 'Import',

  // Inspector
  'inspector.styles': 'Styles',
  'inspector.block': 'Block',
  'inspector.noSelection': 'Select a block to configure it.',

  // Tune menu
  'tune.moveUp': 'Move up',
  'tune.moveDown': 'Move down',
  'tune.duplicate': 'Duplicate',
  'tune.delete': 'Delete',

  // Peso HTML / undo
  'weight.ok': 'Estimated HTML weight. Gmail limit: 100 KB.',
  'weight.warning': 'Warning: near or over the 102 KB limit, Gmail clips the message.',
  'editor.undo': 'Undo (Cmd/Ctrl+Z)',
  'editor.redo': 'Redo (Shift+Cmd/Ctrl+Z)',

  // Dark preview
  'preview.darkToggle': 'Simulate dark mode',
  'preview.darkInfo':
    'Simulation of the color inversion applied by email clients. Real handling (alternative assets, Gmail selectors) comes with the MJML pipeline.',

  // AI
  'ai.improve': 'Improve',
  'ai.formal': 'More formal',
  'ai.persuasive': 'More persuasive',
  'ai.shorten': 'Shorten',
  'ai.translate': 'Translate to…',
  'ai.generating': 'AI generating…',
  'ai.error': 'AI error: please retry.',
  'ai.unavailable': 'AI proxy unreachable. Start it with: npm run ai-proxy',
  'ai.generateSection': 'Generate with AI',
  'ai.generateSection.title': 'Generate a section with AI',
  'ai.generateSection.description':
    'Describe the section to create (e.g. "three products on sale with light blue background and red button").',
  'ai.generateSection.placeholder': 'Describe the section…',
  'ai.generateSection.submit': 'Generate',
  'ai.generateSection.invalid': 'The AI produced an invalid structure. Try a different description.',
  'ai.done': 'Done.',

  // Preflight
  'preflight.title': 'Email check',
  'preflight.subtitle': 'Quality and accessibility checks before sending.',
  'preflight.ok': 'No issues found.',
  'preflight.missingAlt': 'Image without alternative text (alt)',
  'preflight.emptyHref': 'Button or link without destination (href)',
  'preflight.lowContrast': 'Insufficient text/background contrast (WCAG < 4.5:1)',
  'preflight.overweight': 'HTML over the 100 KB threshold (Gmail clipping)',
  'preflight.goToBlock': 'Go to block',

  // Drag & drop
  'dnd.dragHandle': 'Drag to reorder',

  // Exports
  'exports.title': 'Exports',
  'exports.subtitle': 'Export history for this session.',
  'exports.empty': 'No exports in this session.',
  'exports.reExport': 'Re-export',
  'exports.imagesIncluded': 'images included',
  'exports.imagesSkipped': 'skipped',
  'exports.done': 'Export completed.',
  'exports.warningSkipped': 'Some images could not be included (CORS):',
  'exports.generating': 'Generating...',
};

export default en;
