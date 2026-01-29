/**
 * Responsive Utilities for Angular Components
 * Clinic IntelliCare - Mobile Responsive Helper Functions
 */

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

/**
 * Custom breakpoint values matching our SCSS breakpoints
 */
export const CustomBreakpoints = {
  XSmall: '(max-width: 599px)',
  Small: '(min-width: 600px) and (max-width: 959px)',
  Medium: '(min-width: 960px) and (max-width: 1279px)',
  Large: '(min-width: 1280px) and (max-width: 1919px)',
  XLarge: '(min-width: 1920px)',

  // Convenience breakpoints
  Handset: '(max-width: 599px)',
  Tablet: '(min-width: 600px) and (max-width: 959px)',
  Web: '(min-width: 960px)',

  // Orientation
  HandsetPortrait: '(max-width: 599px) and (orientation: portrait)',
  HandsetLandscape: '(max-width: 959px) and (orientation: landscape)',
  TabletPortrait:
    '(min-width: 600px) and (max-width: 839px) and (orientation: portrait)',
  TabletLandscape:
    '(min-width: 960px) and (max-width: 1279px) and (orientation: landscape)',
};

/**
 * Responsive service helper class
 * Inject BreakpointObserver in your component and use these methods
 */
export class ResponsiveHelper {
  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Check if current viewport is mobile (handset)
   */
  isMobile$(): Observable<boolean> {
    return this.breakpointObserver
      .observe([Breakpoints.Handset, CustomBreakpoints.XSmall])
      .pipe(map((result) => result.matches));
  }

  /**
   * Check if current viewport is tablet
   */
  isTablet$(): Observable<boolean> {
    return this.breakpointObserver
      .observe([Breakpoints.Tablet, CustomBreakpoints.Small])
      .pipe(map((result) => result.matches));
  }

  /**
   * Check if current viewport is desktop or larger
   */
  isDesktop$(): Observable<boolean> {
    return this.breakpointObserver
      .observe([Breakpoints.Web, CustomBreakpoints.Web])
      .pipe(map((result) => result.matches));
  }

  /**
   * Check if current viewport is mobile or tablet (not desktop)
   */
  isMobileOrTablet$(): Observable<boolean> {
    return this.breakpointObserver
      .observe([
        Breakpoints.Handset,
        Breakpoints.Tablet,
        CustomBreakpoints.XSmall,
        CustomBreakpoints.Small,
      ])
      .pipe(map((result) => result.matches));
  }

  /**
   * Get current screen size category
   */
  getScreenSize$(): Observable<'mobile' | 'tablet' | 'desktop' | 'large'> {
    return this.breakpointObserver
      .observe([
        CustomBreakpoints.XSmall,
        CustomBreakpoints.Small,
        CustomBreakpoints.Medium,
        CustomBreakpoints.Large,
      ])
      .pipe(
        map((result) => {
          if (this.breakpointObserver.isMatched(CustomBreakpoints.XSmall)) {
            return 'mobile';
          } else if (
            this.breakpointObserver.isMatched(CustomBreakpoints.Small)
          ) {
            return 'tablet';
          } else if (
            this.breakpointObserver.isMatched(CustomBreakpoints.Medium)
          ) {
            return 'desktop';
          } else {
            return 'large';
          }
        }),
      );
  }

  /**
   * Check if device is in portrait mode
   */
  isPortrait$(): Observable<boolean> {
    return this.breakpointObserver
      .observe(['(orientation: portrait)'])
      .pipe(map((result) => result.matches));
  }

  /**
   * Check if device is in landscape mode
   */
  isLandscape$(): Observable<boolean> {
    return this.breakpointObserver
      .observe(['(orientation: landscape)'])
      .pipe(map((result) => result.matches));
  }

  /**
   * Get number of columns for responsive grid based on screen size
   */
  getGridColumns$(
    mobileCol = 1,
    tabletCol = 2,
    desktopCol = 3,
    largeCol = 4,
  ): Observable<number> {
    return this.getScreenSize$().pipe(
      map((size) => {
        switch (size) {
          case 'mobile':
            return mobileCol;
          case 'tablet':
            return tabletCol;
          case 'desktop':
            return desktopCol;
          case 'large':
            return largeCol;
          default:
            return desktopCol;
        }
      }),
    );
  }

  /**
   * Check if touch device (no hover capability)
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Get safe area insets (for notched devices)
   */
  getSafeAreaInsets(): {
    top: string;
    bottom: string;
    left: string;
    right: string;
  } {
    const style = getComputedStyle(document.documentElement);
    return {
      top: style.getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: style.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: style.getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: style.getPropertyValue('env(safe-area-inset-right)') || '0px',
    };
  }
}

/**
 * Standalone helper functions (no DI required)
 */

/**
 * Check if current device is iOS
 */
export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
}

/**
 * Check if current device is Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Check if running as standalone PWA
 */
export function isStandalonePWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Get viewport width
 */
export function getViewportWidth(): number {
  return Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );
}

/**
 * Get viewport height
 */
export function getViewportHeight(): number {
  return Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );
}

/**
 * Check if screen is in portrait orientation
 */
export function isPortraitOrientation(): boolean {
  return window.innerHeight > window.innerWidth;
}

/**
 * Disable iOS bounce/rubber-band scrolling
 */
export function disableIOSBounce(): void {
  if (isIOS()) {
    document.body.style.overscrollBehavior = 'none';
  }
}

/**
 * Enable iOS bounce/rubber-band scrolling
 */
export function enableIOSBounce(): void {
  if (isIOS()) {
    document.body.style.overscrollBehavior = 'auto';
  }
}

/**
 * Prevent zoom on double-tap (iOS Safari)
 */
export function preventDoubleTapZoom(): void {
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (event) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false },
  );
}

/**
 * Detect if device has notch/safe area
 */
export function hasNotch(): boolean {
  if (!isIOS()) return false;

  const div = document.createElement('div');
  div.style.paddingTop = 'env(safe-area-inset-top)';
  document.body.appendChild(div);
  const hasSafeArea = parseInt(getComputedStyle(div).paddingTop) > 0;
  document.body.removeChild(div);

  return hasSafeArea;
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Check if device is retina/high DPI
 */
export function isRetinaDisplay(): boolean {
  return getDevicePixelRatio() >= 2;
}

/**
 * Lock screen orientation (if supported)
 */
export async function lockOrientation(
  orientation: OrientationLockType,
): Promise<void> {
  if ('orientation' in screen && 'lock' in screen.orientation) {
    try {
      await (screen.orientation as ScreenOrientation).lock(orientation);
    } catch (error) {
      console.warn('Orientation lock not supported:', error);
    }
  }
}

/**
 * Unlock screen orientation
 */
export function unlockOrientation(): void {
  if ('orientation' in screen && 'unlock' in screen.orientation) {
    screen.orientation.unlock();
  }
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Add resize listener with debounce
 */
export function addResizeListener(
  callback: () => void,
  debounceMs = 150,
): () => void {
  const debouncedCallback = debounce(callback, debounceMs);
  window.addEventListener('resize', debouncedCallback);

  // Return cleanup function
  return () => window.removeEventListener('resize', debouncedCallback);
}

/**
 * Example usage in a component:
 *
 * ```typescript
 * import { Component, OnInit } from '@angular/core';
 * import { BreakpointObserver } from '@angular/cdk/layout';
 * import { ResponsiveHelper, isIOS, isMobile } from './responsive.utils';
 *
 * @Component({
 *   selector: 'app-my-component',
 *   template: `
 *     <div [class.mobile-layout]="isMobile$ | async">
 *       <div [style.columns]="gridColumns$ | async">
 *         <!-- content -->
 *       </div>
 *     </div>
 *   `
 * })
 * export class MyComponent implements OnInit {
 *   private responsiveHelper: ResponsiveHelper;
 *
 *   isMobile$ = this.responsiveHelper.isMobile$();
 *   isTablet$ = this.responsiveHelper.isTablet$();
 *   gridColumns$ = this.responsiveHelper.getGridColumns$(1, 2, 3, 4);
 *
 *   constructor(private breakpointObserver: BreakpointObserver) {
 *     this.responsiveHelper = new ResponsiveHelper(breakpointObserver);
 *   }
 *
 *   ngOnInit() {
 *     if (isIOS()) {
 *       // iOS-specific logic
 *     }
 *   }
 * }
 * ```
 */
