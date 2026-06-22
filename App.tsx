import { useEffect, useState, useCallback } from 'react';
import {
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PinyinOverlay, {
  ToneStyle,
  type OverlaySettings,
} from './modules/pinyin-overlay';

export default function App() {
  const [accessibilityOn, setAccessibilityOn] = useState(false);
  const [overlayPermission, setOverlayPermission] = useState(false);
  const [settings, setSettings] = useState<OverlaySettings>({
    enabled: true,
    toneStyle: ToneStyle.MARKS,
    textSizeSp: 14,
  });

  const refresh = useCallback(() => {
    setAccessibilityOn(PinyinOverlay.isAccessibilityServiceEnabled());
    setOverlayPermission(PinyinOverlay.canDrawOverlays());
    setSettings(PinyinOverlay.getSettings());
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const update = (patch: Partial<OverlaySettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    PinyinOverlay.updateSettings(next);
  };

  const ready = accessibilityOn && overlayPermission;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>拼音 Pinyin Overlay</Text>
        <Text style={styles.subtitle}>
          Shows pinyin above Chinese text in any app.
        </Text>

        <View style={[styles.status, ready ? styles.ok : styles.warn]}>
          <Text style={styles.statusText}>
            {ready ? '● Active — switch to another app' : '● Setup required'}
          </Text>
        </View>

        <Step
          n={1}
          title="Enable the Accessibility Service"
          done={accessibilityOn}
          actionLabel="Open Accessibility settings"
          onPress={() => PinyinOverlay.openAccessibilitySettings()}
          help="Find “Pinyin Overlay” under Installed/Downloaded apps and turn it on. This lets the app read on-screen text."
        />

        <Step
          n={2}
          title="Allow “Display over other apps”"
          done={overlayPermission}
          actionLabel="Open overlay permission"
          onPress={() => PinyinOverlay.openOverlaySettings()}
          help="Required to draw pinyin on top of other apps."
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>

          <Row label="Overlay on">
            <Toggle
              value={settings.enabled}
              onChange={(v) => update({ enabled: v })}
            />
          </Row>

          <Row label="Tone style">
            <Segmented
              options={[
                { label: 'nǐ hǎo', value: ToneStyle.MARKS },
                { label: 'ni3 hao3', value: ToneStyle.NUMBERS },
                { label: 'ni hao', value: ToneStyle.NONE },
              ]}
              value={settings.toneStyle}
              onChange={(v) => update({ toneStyle: v })}
            />
          </Row>

          <Row label={`Text size (${settings.textSizeSp}sp)`}>
            <Stepper
              value={settings.textSizeSp}
              min={10}
              max={24}
              onChange={(v) => update({ textSizeSp: v })}
            />
          </Row>
        </View>

        <Text style={styles.note}>
          Note: each Chinese text block is covered with a translucent box and the
          pinyin is fitted across it (whole run), since accessibility data doesn’t
          expose per-character pixel positions. Text size sets the upper bound —
          long runs shrink to fit.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step(props: {
  n: number;
  title: string;
  done: boolean;
  actionLabel: string;
  onPress: () => void;
  help: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <View style={[styles.badge, props.done && styles.badgeDone]}>
          <Text style={styles.badgeText}>{props.done ? '✓' : props.n}</Text>
        </View>
        <Text style={styles.cardTitle}>{props.title}</Text>
      </View>
      <Text style={styles.help}>{props.help}</Text>
      {!props.done && (
        <Pressable style={styles.button} onPress={props.onPress}>
          <Text style={styles.buttonText}>{props.actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      style={[styles.toggle, value && styles.toggleOn]}
      onPress={() => onChange(!value)}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => (
        <Pressable
          key={String(o.value)}
          style={[styles.segment, value === o.value && styles.segmentOn]}
          onPress={() => onChange(o.value)}
        >
          <Text
            style={[
              styles.segmentText,
              value === o.value && styles.segmentTextOn,
            ]}
          >
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        style={styles.stepBtn}
        onPress={() => onChange(Math.max(min, value - 1))}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Pressable
        style={styles.stepBtn}
        onPress={() => onChange(Math.min(max, value + 1))}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1115' },
  content: { padding: 20, gap: 14 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 8 },
  subtitle: { color: '#9aa0aa', fontSize: 15 },
  status: { borderRadius: 12, padding: 12, marginTop: 4 },
  ok: { backgroundColor: '#16361f' },
  warn: { backgroundColor: '#3a2a12' },
  statusText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#1a1d24', borderRadius: 14, padding: 16, gap: 10 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#33373f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: { backgroundColor: '#2e7d4f' },
  badgeText: { color: '#fff', fontWeight: '700' },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '600', flexShrink: 1 },
  help: { color: '#9aa0aa', fontSize: 13, lineHeight: 18 },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 2,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { color: '#d4d7dd', fontSize: 15, flexShrink: 1, paddingRight: 8 },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3a3f48',
    padding: 3,
  },
  toggleOn: { backgroundColor: '#3b82f6' },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  knobOn: { alignSelf: 'flex-end' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#11141a',
    borderRadius: 9,
    padding: 3,
  },
  segment: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 7 },
  segmentOn: { backgroundColor: '#3b82f6' },
  segmentText: { color: '#9aa0aa', fontSize: 13 },
  segmentTextOn: { color: '#fff', fontWeight: '600' },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#33373f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  note: { color: '#6b7280', fontSize: 12, lineHeight: 17, marginTop: 4 },
});
