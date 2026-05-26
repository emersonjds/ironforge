import * as Haptics from "expo-haptics";

export const haptics = {
  tap: () => Haptics.selectionAsync(),
  setLogged: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  pr: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  longPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};
