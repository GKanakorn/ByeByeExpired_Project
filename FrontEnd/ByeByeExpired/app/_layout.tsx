import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // เปลี่ยน anchor เป็น index เพราะเราอยากให้เปิดมาเจอหน้า Login (index) ก่อน
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* หน้าต่างๆ ของคุณ */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}