import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Renew, RenewFonts } from '@/constants/renew-theme';
import { Spacing } from '@/constants/theme';
import { useReminder } from '@/hooks/use-reminder';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function timeToDate(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function ReminderToggle({
  slug,
  title,
  body,
}: {
  slug: string;
  title: string;
  body: string;
}) {
  const { reminder, isSaving, permissionDenied, setTime, clear } = useReminder(slug, title, body);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingDate, setPendingDate] = useState(() => timeToDate(reminder?.hour ?? 8, reminder?.minute ?? 0));

  function onChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setPickerVisible(false);
      if (event.type === 'set' && selected) {
        setTime(selected.getHours(), selected.getMinutes());
      }
      return;
    }

    if (selected) setPendingDate(selected);
  }

  function confirmIOS() {
    setPickerVisible(false);
    setTime(pendingDate.getHours(), pendingDate.getMinutes());
  }

  return (
    <View style={styles.container}>
      {reminder ? (
        <View style={styles.row}>
          <Text style={styles.label}>
            Daily reminder at {pad(reminder.hour)}:{pad(reminder.minute)}
          </Text>
          <Pressable onPress={() => setPickerVisible(true)} hitSlop={8}>
            <Text style={styles.link}>Change</Text>
          </Pressable>
          <Pressable onPress={clear} hitSlop={8} disabled={isSaving}>
            <Text style={styles.linkMuted}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setPickerVisible(true)} disabled={isSaving} style={styles.cta}>
          <Text style={styles.ctaText}>Remind me daily</Text>
        </Pressable>
      )}

      {permissionDenied ? (
        <Text style={styles.warning}>
          Enable notifications for this app in your system settings.
        </Text>
      ) : null}

      {pickerVisible ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={pendingDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={confirmIOS} style={styles.confirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Renew.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  label: {
    flex: 1,
    fontFamily: RenewFonts.regular,
    fontSize: 13,
    color: Renew.dark,
  },
  link: {
    fontFamily: RenewFonts.semibold,
    fontSize: 13,
    color: Renew.sage,
  },
  linkMuted: {
    fontFamily: RenewFonts.regular,
    fontSize: 13,
    color: Renew.muted,
  },
  cta: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Renew.sage,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  ctaText: {
    fontFamily: RenewFonts.semibold,
    fontSize: 13,
    color: Renew.sage,
  },
  warning: {
    marginTop: Spacing.two,
    fontFamily: RenewFonts.regular,
    fontSize: 12,
    color: Renew.clay,
  },
  pickerWrap: {
    marginTop: Spacing.two,
  },
  confirm: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  confirmText: {
    fontFamily: RenewFonts.bold,
    fontSize: 13,
    color: Renew.sage,
  },
});
