# Cyber Ocean Theme - Setup Guide

## File Structure

Place these files in your Next.js app:

```
/lib/
  theme.ts                    # Theme constants (colors, spacing, effects)

/app/components/
  ui.tsx                      # Shared UI components (or ui/index.tsx)

/app/
  globals.css                 # Add the CSS variables (optional, for utility classes)
```

## Quick Start

### 1. Add Theme Constants (`/lib/theme.ts`)

Contains all color values and styling tokens in one place. Import from any component:

```tsx
import { theme, SectionColor } from '@/lib/theme';

// Use colors
style={{ background: theme.colors.bg.card }}
style={{ border: `1px solid ${theme.colors.border.primary}` }}
```

### 2. Add Shared Components (`/app/components/ui.tsx`)

Exports these reusable components:

| Component | Purpose |
|-----------|---------|
| `PageLayout` | Wrapper with background effects |
| `StickyHeader` | Sticky header with backdrop blur |
| `Card` | Basic card container |
| `Section` | Collapsible accordion section |
| `SectionDot` | Colored dot indicator |
| `EntryRow` | Label + value + copy button |
| `InfoRow` | Label + value (no copy) |
| `CopyButton` | Copy to clipboard button |
| `Tag` | Colored tag/badge |
| `PillButton` | Filter/nav pill button |
| `Toast` | Copy confirmation toast |
| `BackButton` | Back navigation button |
| `PageLabel` | Page identifier label |

### 3. Usage Example

```tsx
import {
  PageLayout,
  StickyHeader,
  Section,
  EntryRow,
  Tag,
  Toast,
  BackButton,
  PageLabel,
} from '@/app/components/ui';

export default function MyPage() {
  const [expanded, setExpanded] = useState<string | null>('section1');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, field: string) => {
    copy(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <PageLayout>
      <StickyHeader>
        <div className="flex justify-between p-4">
          <BackButton href="/back" />
          <PageLabel>MY_PAGE</PageLabel>
        </div>
        <h1>Page Title</h1>
        <Tag color="emerald">ACTIVE</Tag>
      </StickyHeader>

      <div className="p-4 space-y-2.5">
        <Section
          color="emerald"
          title="Contact Info"
          count={3}
          isExpanded={expanded === 'section1'}
          onToggle={() => setExpanded(expanded === 'section1' ? null : 'section1')}
        >
          <EntryRow
            label="Email"
            value="test@example.com"
            copyField="email"
            copiedField={copiedField}
            onCopy={handleCopy}
          />
        </Section>
      </div>

      <Toast show={!!copiedField} />
    </PageLayout>
  );
}
```

## Color Palette

### Section Colors
- `emerald` - Green (#34d399) - Contacts, Provincial
- `blue` - Blue (#60a5fa) - Visits, Supreme
- `amber` - Yellow (#fbbf24) - Callbacks, Sheriff
- `cyan` - Cyan (#22d3ee) - Teams, eDisclosure
- `indigo` - Indigo (#a5b4fc) - MS Teams
- `purple` - Purple (#a78bfa) - Federal, Support
- `teal` - Teal (#2dd4bf) - Bail

### Background Colors
- `bg.primary` - Main background (#080b12)
- `bg.card` - Card background (translucent blue)
- `bg.cardHover` - Hover state
- `bg.subtle` - Subtle background for content areas

## Benefits of This Setup

| Before | After |
|--------|-------|
| 511 lines (centre-detail-page) | 285 lines (44% reduction) |
| Inline styles everywhere | Centralized theme constants |
| Duplicated components | Shared component library |
| Hard to maintain | Easy to update globally |

## Optional: CSS Variables

For teams that prefer CSS classes, add `globals-cyber-ocean.css` to your project and use classes like:

```html
<div class="co-card">
  <div class="co-card-header co-section-title">Contact</div>
  <div class="co-card-body">
    <div class="co-entry-row">
      <div class="co-entry-label">Email</div>
      <span>test@example.com</span>
    </div>
  </div>
</div>
```
