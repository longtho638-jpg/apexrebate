# Catalyst Dashboard - Quick Start Guide

## Live Dashboard URL
```
https://apexrebate-1-flgjd69vx-minh-longs-projects-f5c82c9b.vercel.app/vi/dashboard
```

## Local Development

### Start Dev Server
```bash
npm run dev
```

Dashboard available at: `http://localhost:3000/vi/dashboard`

### Test Credentials
- Email: `demo@apexrebate.com`
- Password: `demo123`

## Key Components

### Dashboard Component Structure
```
Dashboard (Client)
├── Stats Overview (4-column grid)
│   ├── Total Savings Card
│   ├── Monthly Savings Card
│   ├── Trading Volume Card
│   └── Current Rank Card
└── Tab Sections
    ├── Overview
    │   ├── Savings History
    │   ├── Broker Distribution
    │   └── Rank Progress
    ├── Analytics
    │   ├── Performance Analysis
    │   └── Savings Forecast
    ├── Referrals
    │   ├── Referral Statistics
    │   └── Referral Links
    └── Achievements
        └── Achievement Grid
```

## Catalyst Component Library

### Available Components

#### Text Components
```tsx
import { Heading, Subheading } from '@/components/catalyst/heading';
import { Text, Strong, Code } from '@/components/catalyst/text';

<Heading>Title</Heading>
<Heading level={3}>Subtitle</Heading>
<Subheading>Description</Subheading>
<Text>Body text</Text>
<Strong>Bold text</Strong>
<Code>code()</Code>
```

#### Form Components
```tsx
import { Fieldset, Legend, Label, Description } from '@/components/catalyst/fieldset';
import { Input } from '@/components/catalyst/input';

<Fieldset>
  <Legend>Form Section</Legend>
  <Label>Field Label</Label>
  <Description>Help text</Description>
  <Input type="text" placeholder="Enter..." />
</Fieldset>
```

#### Tab Components
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/catalyst/tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Content...</TabsContent>
  <TabsContent value="details">Content...</TabsContent>
</Tabs>
```

#### Badge Component
```tsx
import { Badge } from '@/components/catalyst/badge';

<Badge className="bg-blue-100 text-blue-900">
  Diamond
</Badge>
```

## Styling Guide

### Colors
```
Primary Blue:     #2563eb
Success Green:    #16a34a
Warning Orange:   #f97316
Neutral Slate:    #0f172a to #f1f5f9
```

### Spacing (Tailwind Scale)
```
Padding:  p-6 (24px)
Margin:   m-6 (24px)
Gap:      gap-6 (24px)
```

### Typography
```
Heading:  text-3xl font-bold
Subhead:  text-xl font-semibold
Body:     text-sm text-slate-700
Small:    text-xs text-slate-600
```

## Data Flow

### 1. Page Server Component
```tsx
// src/app/[locale]/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login`);
  return <DashboardClient />;
}
```

### 2. Client Component
```tsx
// src/app/[locale]/dashboard/dashboard-client-vi.tsx
export default function Dashboard() {
  const [userData, setUserData] = useState(...);
  
  useEffect(() => {
    const data = await fetch('/api/dashboard');
    setUserData(data);
  }, []);
  
  return <Dashboard UI />;
}
```

### 3. API Route
```tsx
// src/app/api/dashboard/route.ts
export async function GET(req) {
  const session = await auth();
  const user = await db.users.findUnique({...});
  return { userData, savingsHistory, achievements };
}
```

## Customization

### Add New Card
```tsx
<div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
  <Heading level={3}>Title</Heading>
  <Text>Content...</Text>
</div>
```

### Add New Tab Section
```tsx
<TabsContent value="new-tab" className="space-y-8">
  {/* Your content */}
</TabsContent>
```

### Update Colors
Replace color classes in the component:
- `bg-green-100` → `bg-blue-100`
- `text-green-600` → `text-blue-600`
- `border-green-200` → `border-blue-200`

## Performance Tips

1. **Data Caching**: API responses are cached in state
2. **Lazy Loading**: Content loads after component mounts
3. **Icon Optimization**: Icons from lucide-react (tree-shakeable)
4. **Responsive Images**: Next.js Image component for assets
5. **Code Splitting**: Each tab is loaded on demand

## Troubleshooting

### Dashboard shows loading spinner
- Check network tab for API errors
- Verify `/api/dashboard` endpoint is responding
- Ensure user is authenticated

### Icons not displaying
- Check import paths: `from 'lucide-react'`
- Verify icon names match Lucide library

### Styles not applying
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind config includes src/

### Copy-to-clipboard not working
- Browser must support Clipboard API
- Check for https in production

## Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Firebase Deploy
```bash
npm run build
firebase deploy
```

### Vercel Deploy
```bash
vercel --prod
```

## Monitoring

### Check Build Size
```bash
npm run build
# Output shows route sizes
```

### Test All Tabs
1. Navigate to Overview
2. Switch to Analytics
3. Check Referrals
4. View Achievements

### Mobile Responsiveness
- Test on iPhone 12: 390px
- Test on iPad: 768px
- Test on Desktop: 1920px

## Documentation

- **Catalyst Docs**: https://catalyst.tailwindui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Lucide Icons**: https://lucide.dev/
- **React Docs**: https://react.dev/

## Support

For issues or questions:
1. Check Catalyst documentation
2. Review component examples
3. Test in development first
4. Check browser console for errors

---

**Last Updated**: November 8, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
