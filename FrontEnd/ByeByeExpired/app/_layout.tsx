import { Stack, router, usePathname } from 'expo-router'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../src/supabase'
import { LocationProvider } from '../src/context/LocationContext'

export default function RootLayout() {
  const pathname = usePathname()

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {

        if (event === 'INITIAL_SESSION') return

        const user = session?.user

        console.log('[AUTH]', {
          event,
          path: pathname,
          email: user?.email,
          confirmed: user?.email_confirmed_at,
        })

        // ❌ ยังไม่ login
        if (!user) {
          if (pathname !== '/Register') {
            router.replace('/Register')
          }
          return
        }

        const isEmailProvider =
          user.app_metadata?.providers?.includes('email')

        // ❌ email ยังไม่ confirm
        if (isEmailProvider && !user.email_confirmed_at) {
          if (pathname !== '/confirm-email') {
            router.replace('/confirm-email')
          }
          return
        }

        // ✅ ผ่าน auth แล้ว → ไม่ redirect เพิ่ม
      })

    return () => subscription.unsubscribe()
  }, [pathname])

  return (
    <LocationProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </LocationProvider>
  )
}