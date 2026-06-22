import { requireNativeModule } from 'expo-modules-core';

export enum ToneStyle {
  MARKS = 'marks', // nǐ hǎo
  NUMBERS = 'numbers', // ni3 hao3
  NONE = 'none', // ni hao
}

export type OverlaySettings = {
  enabled: boolean;
  toneStyle: ToneStyle;
  textSizeSp: number;
};

type PinyinOverlayModule = {
  /** Whether our AccessibilityService is currently enabled by the user. */
  isAccessibilityServiceEnabled(): boolean;
  /** Whether "Display over other apps" (SYSTEM_ALERT_WINDOW) is granted. */
  canDrawOverlays(): boolean;
  /** Opens system Accessibility settings so the user can enable the service. */
  openAccessibilitySettings(): void;
  /** Opens the "Display over other apps" permission screen for this app. */
  openOverlaySettings(): void;
  getSettings(): OverlaySettings;
  updateSettings(settings: OverlaySettings): void;
};

// Resolves to the native module registered by PinyinOverlayModule.kt.
export default requireNativeModule<PinyinOverlayModule>('PinyinOverlay');
