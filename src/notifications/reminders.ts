import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Hatirlatmalar',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function scheduleDailyReminders() {
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return;

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const slots = [
    { hour: 9, minute: 0, title: 'Su hatirlatmasi', body: 'Bir bardak su icmeyi dene.' },
    { hour: 13, minute: 0, title: 'Ogle suyu', body: 'Su sisesini yaninda tut.' },
    { hour: 18, minute: 30, title: 'Aksam kontrolu', body: 'Gunluk gorevlerine goz at.' },
  ];

  for (let i = 0; i < slots.length; i += 1) {
    const slot = slots[i];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: slot.title,
        body: slot.body,
        sound: false,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour: slot.hour,
        minute: slot.minute,
      },
      identifier: `vh-daily-${i}`,
    });
  }
}
