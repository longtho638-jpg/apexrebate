# Catalyst Component Library

A collection of modern, production-ready React components built with Tailwind CSS, following the Catalyst design system by Tailwind Labs.

## Components

### Heading (`heading.tsx`)

Semantic heading components with multiple levels.

```tsx
import { Heading, Subheading } from '@/components/catalyst/heading';

// Level 1 (h1)
<Heading>Main Title</Heading>

// Level 2 (h2)
<Heading level={2}>Section Title</Heading>

// Level 3 (h3)
<Heading level={3}>Subsection</Heading>

// Level 4 (h4)
<Heading level={4}>Small Title</Heading>

// Subheading
<Subheading>Descriptive text under main heading</Subheading>
```

### Text (`text.tsx`)

Text styling components for body content.

```tsx
import { Text, Strong, Code } from '@/components/catalyst/text';

// Regular text
<Text>This is body text</Text>

// Strong/bold text
<Text>This is <Strong>important</Strong> information</Text>

// Inline code
<Text>Use <Code>npm install</Code> to get started</Text>
```

### Fieldset (`fieldset.tsx`)

Form-related components for organizing form fields.

```tsx
import { Fieldset, Legend, Label, Description } from '@/components/catalyst/fieldset';

<Fieldset>
  <Legend>Account Information</Legend>
  
  <div className="space-y-4">
    <div>
      <Label htmlFor="email">Email Address</Label>
      <Description>We'll never share your email</Description>
      <input id="email" type="email" />
    </div>
    
    <div>
      <Label htmlFor="name">Full Name</Label>
      <input id="name" type="text" />
    </div>
  </div>
</Fieldset>
```

### Input (`input.tsx`)

Styled input field component with built-in focus states.

```tsx
import { Input } from '@/components/catalyst/input';

// Basic input
<Input type="text" placeholder="Enter text..." />

// Email input
<Input type="email" placeholder="your@email.com" />

// Password input
<Input type="password" placeholder="Enter password" />

// Disabled input
<Input type="text" placeholder="Disabled" disabled />

// With custom styling
<Input 
  type="text" 
  placeholder="Custom styled"
  className="border-red-300"
/>
```

### Tabs (`tabs.tsx`)

Tab navigation component with multiple sections.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/catalyst/tabs';

<Tabs defaultValue="overview" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    <h2>Overview Content</h2>
    <p>This is the overview tab content.</p>
  </TabsContent>
  
  <TabsContent value="details">
    <h2>Details Content</h2>
    <p>This is the details tab content.</p>
  </TabsContent>
  
  <TabsContent value="settings">
    <h2>Settings Content</h2>
    <p>This is the settings tab content.</p>
  </TabsContent>
</Tabs>
```

### Badge (`badge.tsx`)

Status badge component with flexible styling.

```tsx
import { Badge } from '@/components/catalyst/badge';

// Status badges
<Badge className="bg-green-100 text-green-900">Active</Badge>
<Badge className="bg-red-100 text-red-900">Inactive</Badge>
<Badge className="bg-blue-100 text-blue-900">Pending</Badge>

// Tier badges
<Badge className="bg-orange-100 text-orange-900">Bronze</Badge>
<Badge className="bg-gray-100 text-gray-900">Silver</Badge>
<Badge className="bg-yellow-100 text-yellow-900">Gold</Badge>
<Badge className="bg-purple-100 text-purple-900">Platinum</Badge>
<Badge className="bg-blue-100 text-blue-900">Diamond</Badge>
```

## Design System

### Color Palette

```
Primary Colors:
  Blue:     #2563eb (text-blue-600, bg-blue-100, etc.)
  Green:    #16a34a (text-green-600, bg-green-100, etc.)
  Purple:   #a855f7 (text-purple-600, bg-purple-100, etc.)
  Orange:   #f97316 (text-orange-600, bg-orange-100, etc.)

Neutral Colors:
  Slate-900: #0f172a (text)
  Slate-700: #334155 (body text)
  Slate-600: #475569 (secondary text)
  Slate-500: #64748b (tertiary text)
  Slate-300: #cbd5e1 (borders)
  Slate-200: #e2e8f0 (light backgrounds)
  Slate-100: #f1f5f9 (lighter backgrounds)
  Slate-50:  #f8fafc (lightest backgrounds)
```

### Typography

```
Heading (h1):     text-3xl font-bold tracking-tight
Heading (h2):     text-2xl font-bold tracking-tight
Heading (h3):     text-xl font-semibold tracking-tight
Heading (h4):     text-lg font-semibold
Subheading:       text-base text-slate-600 mt-2
Body Text:        text-sm text-slate-700
Secondary Text:   text-sm text-slate-600
Small Text:       text-xs text-slate-600
Code:             text-sm font-mono text-slate-900
```

### Spacing

```
Padding:
  p-3  = 12px (small)
  p-4  = 16px (medium)
  p-6  = 24px (large)

Margin & Gap:
  m-2  = 8px
  m-4  = 16px
  m-6  = 24px
  gap-2 = 8px
  gap-4 = 16px
  gap-6 = 24px
```

### Border Radius

```
Rounded:
  rounded   = 0.25rem (4px)
  rounded-lg = 0.5rem (8px)
  rounded-full = 9999px (circles)
```

## Usage Examples

### Complete Form Section

```tsx
<div className="rounded-lg border border-slate-200 bg-white p-6">
  <Heading level={3} className="mb-6">Profile Settings</Heading>
  
  <Fieldset className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="name">Display Name</Label>
      <Description>Your public profile name</Description>
      <Input 
        id="name" 
        type="text" 
        placeholder="John Doe"
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input 
        id="email" 
        type="email" 
        placeholder="john@example.com"
      />
    </div>
  </Fieldset>
</div>
```

### Stats Card

```tsx
<div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <Text className="text-sm font-medium text-slate-600 mb-2">
        Total Users
      </Text>
      <div className="text-2xl font-bold text-slate-900">
        1,234
      </div>
    </div>
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
      <Users className="w-6 h-6 text-blue-600" />
    </div>
  </div>
</div>
```

### Tab Navigation

```tsx
<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-lg">
    <TabsTrigger value="tab1">Overview</TabsTrigger>
    <TabsTrigger value="tab2">Analytics</TabsTrigger>
    <TabsTrigger value="tab3">Reports</TabsTrigger>
    <TabsTrigger value="tab4">Settings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1" className="mt-6">
    <p>Tab 1 content</p>
  </TabsContent>
  
  <TabsContent value="tab2" className="mt-6">
    <p>Tab 2 content</p>
  </TabsContent>
</Tabs>
```

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators visible on all interactive elements
- Color contrast ratios meet WCAG AA standards
- Proper heading hierarchy (h1, h2, h3, h4)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

All components accept a `className` prop for custom styling:

```tsx
<Heading className="text-purple-900">Custom Color</Heading>
<Badge className="bg-custom-color text-custom-text">Custom Badge</Badge>
<Input className="border-red-300" />
```

## File Structure

```
src/components/catalyst/
├── heading.tsx      # Heading & Subheading
├── text.tsx         # Text, Strong, Code
├── fieldset.tsx     # Form field components
├── input.tsx        # Input field
├── tabs.tsx         # Tab navigation
├── badge.tsx        # Badge component
└── README.md        # This file
```

## Dependencies

- React 19+
- Tailwind CSS 4+
- TypeScript (optional, but recommended)

## License

Part of the ApexRebate project.

---

Last updated: November 8, 2025
