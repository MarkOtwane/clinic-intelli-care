# 📱 Responsive Design Quick Reference

## Screen Sizes & Breakpoints

| Device     | Width          | Breakpoint               | Columns (Stats/Cards) |
| ---------- | -------------- | ------------------------ | --------------------- |
| 📱 Mobile  | < 600px        | `@include mobile`        | 1 / 1                 |
| 📲 Tablet  | 600px - 959px  | `@include tablet`        | 2 / 2                 |
| 💻 Desktop | 960px - 1279px | `@include desktop`       | 4 / 2                 |
| 🖥️ Large   | ≥ 1280px       | `@include large-desktop` | 4 / 3                 |

## Quick Add Responsive Styles

### In SCSS Files

```scss
// Import at top of file
@import "/responsive.scss";

// Use mixins
.my-component {
	@include responsive-padding(1rem, 1.5rem, 2rem);

	@include mobile {
		// Mobile styles
	}

	@include tablet {
		// Tablet styles
	}

	@include desktop {
		// Desktop styles
	}
}

// Responsive grid
.my-grid {
	@include responsive-grid(1, 2, 3); // mobile, tablet, desktop
}
```

### In HTML Templates

```html
<!-- Hide/Show -->
<div class="hide-on-mobile">Desktop only</div>
<div class="show-on-mobile-only">Mobile only</div>

<!-- Responsive Grid -->
<div class="grid-responsive-3">
	<div>Item 1</div>
	<div>Item 2</div>
	<div>Item 3</div>
</div>

<!-- Stack on mobile -->
<div class="flex mobile-stack">
	<div>Left</div>
	<div>Right</div>
</div>

<!-- Full width on mobile -->
<button class="mobile-full-width">Button</button>
```

### In TypeScript Components

```typescript
import { BreakpointObserver } from "@angular/cdk/layout";
import { ResponsiveHelper } from "@shared/utils/responsive.utils";

export class MyComponent {
	private responsive: ResponsiveHelper;

	isMobile$ = this.responsive.isMobile$();
	gridColumns$ = this.responsive.getGridColumns$(1, 2, 3, 4);

	constructor(private breakpointObserver: BreakpointObserver) {
		this.responsive = new ResponsiveHelper(breakpointObserver);
	}
}
```

## Common Patterns

### Dashboard Stats Grid

```html
<div class="stats-grid">
	<div class="stat-card">Stat 1</div>
	<div class="stat-card">Stat 2</div>
	<div class="stat-card">Stat 3</div>
	<div class="stat-card">Stat 4</div>
</div>
```

→ Auto adjusts: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)

### Content Cards Grid

```html
<div class="cards-grid">
	<mat-card>Card 1</mat-card>
	<mat-card>Card 2</mat-card>
</div>
```

→ Auto adjusts: 1 col (mobile), 2 cols (tablet/desktop)

### Forms

```html
<div class="form-grid">
	<mat-form-field>First Name</mat-form-field>
	<mat-form-field>Last Name</mat-form-field>
	<mat-form-field class="form-field-full">Email</mat-form-field>
</div>
```

→ Auto adjusts: 1 col (mobile), 2 cols (desktop)

### Doctor Selection

```html
<div class="doctors-grid">
	<div class="doctor-card">Doctor 1</div>
	<div class="doctor-card">Doctor 2</div>
	<div class="doctor-card">Doctor 3</div>
</div>
```

→ Auto adjusts: 1 (mobile), 2 (tablet), 3 (desktop), 4 (large)

### Time Slots

```html
<div class="time-slots-grid">
	<button class="time-slot-button">9:00</button>
	<button class="time-slot-button">10:00</button>
	<!-- more slots -->
</div>
```

→ Auto adjusts: 2 (mobile), 4 (tablet), 6 (desktop)

## Material Component Tips

### Buttons on Mobile

```html
<!-- Auto full-width on mobile -->
<mat-card-actions>
	<button mat-raised-button>Action 1</button>
	<button mat-button>Action 2</button>
</mat-card-actions>
```

### Tables on Mobile

```html
<!-- Auto horizontal scroll -->
<div class="table-responsive">
	<table mat-table [dataSource]="dataSource">
		<!-- columns -->
	</table>
</div>
```

### Dialogs

Dialogs automatically adjust:

- Mobile: Full width with margins, stacked buttons
- Desktop: Centered, inline buttons

### Sidenav

```html
<mat-sidenav-container>
	<mat-sidenav [mode]="(isMobile$ | async) ? 'over' : 'side'">
		<!-- menu -->
	</mat-sidenav>
	<mat-sidenav-content>
		<!-- content -->
	</mat-sidenav-content>
</mat-sidenav-container>
```

## Utility Classes Reference

### Visibility

- `hide-on-mobile` - Hide on mobile
- `hide-on-tablet` - Hide on tablet
- `hide-on-desktop` - Hide on desktop
- `show-on-mobile-only` - Show only on mobile
- `show-on-tablet-only` - Show only on tablet
- `show-on-desktop-only` - Show only on desktop

### Layout

- `mobile-stack` - Stack children vertically on mobile
- `mobile-full-width` - 100% width on mobile
- `flex-column-mobile` - Flex column on mobile
- `flex-column-tablet` - Flex column on mobile/tablet

### Text

- `text-center-mobile` - Center text on mobile
- `text-left-mobile` - Left align on mobile

### Grids

- `grid-responsive-1` - 1 column always
- `grid-responsive-2` - 1 (mobile), 2 (tablet/desktop)
- `grid-responsive-3` - 1 (mobile), 2 (tablet), 3 (desktop)
- `grid-responsive-4` - 1 (mobile), 2 (tablet), 4 (desktop)

## Testing

### Browser DevTools

1. Press `F12` to open DevTools
2. Press `Ctrl+Shift+M` to toggle device toolbar
3. Select device or custom dimensions
4. Test both portrait and landscape

### Common Test Sizes

- iPhone SE: 375 × 667
- iPhone 14: 390 × 844
- iPad Mini: 768 × 1024
- iPad Pro: 1024 × 1366
- Desktop: 1920 × 1080

### Test From Real Device

```bash
ng serve --host 0.0.0.0
# Access from http://YOUR-IP:4200
```

## Common Issues & Fixes

### Issue: Text too small on mobile

```scss
// Add responsive font size
h1 {
	@include responsive-font-size(1.5rem, 2rem, 2.5rem);
}
```

### Issue: Grid not stacking

```html
<!-- Use predefined grid class -->
<div class="cards-grid">
	<!-- content -->
</div>
```

### Issue: Buttons too close together

```html
<!-- Add gap -->
<div class="flex gap-4 mobile-stack">
	<button>Button 1</button>
	<button>Button 2</button>
</div>
```

### Issue: Table overflow

```html
<!-- Wrap in responsive container -->
<div class="table-responsive">
	<table mat-table>
		...
	</table>
</div>
```

### Issue: Form too cramped

```html
<!-- Use form grid -->
<div class="form-grid">
	<mat-form-field>Field 1</mat-form-field>
	<mat-form-field>Field 2</mat-form-field>
</div>
```

## Files Reference

| File                         | Purpose                         |
| ---------------------------- | ------------------------------- |
| `responsive.scss`            | Mixins & utilities              |
| `healthcare-responsive.scss` | Component styles                |
| `styles.css`                 | Global responsive media queries |
| `theme.scss`                 | Material component responsive   |
| `responsive.utils.ts`        | TypeScript helpers              |

## Need Help?

See full documentation: [MOBILE_RESPONSIVE_GUIDE.md](./MOBILE_RESPONSIVE_GUIDE.md)
