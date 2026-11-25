import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';

const pad = (n: number): string => String(n).padStart(2, '0');

/** Parses "HH:mm" (and tolerates "9:5", "9.30", "0930"). Returns null if unusable. */
export const parseTime = (value: string): { hour: number; minute: number } | null => {
  const digits = (value || '').replace(/\D/g, '');
  let hour: number;
  let minute: number;

  const separated = /^(\d{1,2})\D+(\d{1,2})$/.exec((value || '').trim());
  if (separated) {
    hour = Number(separated[1]);
    minute = Number(separated[2]);
  } else if (digits.length === 3) {
    hour = Number(digits.slice(0, 1));
    minute = Number(digits.slice(1));
  } else if (digits.length === 4) {
    hour = Number(digits.slice(0, 2));
    minute = Number(digits.slice(2));
  } else {
    return null;
  }

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
};

/** Always returns a backend-safe "HH:mm" string. */
export const formatTime = (hour: number, minute: number): string =>
  `${pad(((hour % 24) + 24) % 24)}:${pad(((minute % 60) + 60) % 60)}`;

/** Human-friendly label, e.g. "9:00 AM". */
export const toDisplayTime = (value: string): string => {
  const parsed = parseTime(value);
  if (!parsed) return '--:--';
  const suffix = parsed.hour < 12 ? 'AM' : 'PM';
  const hour12 = parsed.hour % 12 === 0 ? 12 : parsed.hour % 12;
  return `${hour12}:${pad(parsed.minute)} ${suffix}`;
};

interface TimeFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Minute increment used by the +/- buttons. Default 5. */
  minuteStep?: number;
  /** Shown under the field when there is no error. */
  hint?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  /** Start with the picker panel open. Default false. */
  defaultOpen?: boolean;
}

export default function TimeField({
  label,
  value,
  onChange,
  minuteStep = 5,
  hint,
  error,
  containerStyle,
  defaultOpen = false,
}: TimeFieldProps) {
  const [open, setOpen] = useState(defaultOpen);

  const parsed = parseTime(value) ?? { hour: 9, minute: 0 };
  const { hour, minute } = parsed;

  const emit = (nextHour: number, nextMinute: number) => {
    onChange(formatTime(nextHour, nextMinute));
  };

  const shiftHour = (delta: number) => emit(hour + delta, minute);

  const shiftMinute = (delta: number) => {
    // Snap to the step grid first so odd values (e.g. 07) normalise cleanly.
    const snapped =
      delta > 0
        ? Math.floor(minute / minuteStep) * minuteStep + minuteStep
        : Math.ceil(minute / minuteStep) * minuteStep - minuteStep;

    if (snapped >= 60) {
      emit(hour + 1, snapped - 60);
      return;
    }
    if (snapped < 0) {
      emit(hour - 1, snapped + 60);
      return;
    }
    emit(hour, snapped);
  };

  const Stepper = ({
    unitLabel,
    display,
    onIncrease,
    onDecrease,
  }: {
    unitLabel: string;
    display: string;
    onIncrease: () => void;
    onDecrease: () => void;
  }) => (
    <View style={styles.stepperCol}>
      <Text style={styles.unitLabel}>{unitLabel}</Text>
      <View style={styles.stepperBox}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={onDecrease}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="remove" size={16} color={Colors.brand} />
        </TouchableOpacity>
        <Text style={styles.stepValue}>{display}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={onIncrease}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="add" size={16} color={Colors.brand} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.field, Boolean(error) && styles.fieldError]}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.75}
      >
        <Ionicons name="time-outline" size={18} color={Colors.muted} />
        <Text style={styles.fieldValue}>{formatTime(hour, minute)}</Text>
        <Text style={styles.fieldMeridiem}>{toDisplayTime(formatTime(hour, minute))}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.muted}
        />
      </TouchableOpacity>

      {open ? (
        <View style={styles.panel}>
          <View style={styles.steppersRow}>
            <Stepper
              unitLabel="HOUR"
              display={pad(hour)}
              onIncrease={() => shiftHour(1)}
              onDecrease={() => shiftHour(-1)}
            />
            <Text style={styles.colon}>:</Text>
            <Stepper
              unitLabel={`MINUTE (${minuteStep}m)`}
              display={pad(minute)}
              onIncrease={() => shiftMinute(1)}
              onDecrease={() => shiftMinute(-1)}
            />
          </View>
        </View>
      ) : null}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    backgroundColor: Colors.surface,
  },
  fieldError: {
    borderColor: Colors.absent,
    backgroundColor: Colors.tintError,
  },
  fieldValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  fieldMeridiem: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  panel: {
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  steppersRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  stepperCol: {
    flex: 1,
  },
  unitLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  colon: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.muted,
    paddingBottom: 8,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.absent,
    marginTop: Spacing.xs,
  },
  hintText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: Spacing.xs,
  },
});
