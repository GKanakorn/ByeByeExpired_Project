import { Stack, router, usePathname } from 'expo-router'
import { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../src/supabase'

export default function RootLayout() {
  const pathname = usePathname()

  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {

        // ❌ ไม่ทำอะไรตอน initial
        if (event === 'INITIAL_SESSION') return

        const user = session?.user

        console.log('[AUTH]', {
          event,
          path: pathname,
          email: user?.email,
          confirmed: user?.email_confirmed_at,
          providers: user?.app_metadata?.providers,
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

        // ❌ สมัครด้วย email แต่ยังไม่ confirm
        if (isEmailProvider && !user.email_confirmed_at) {
          if (pathname !== '/confirm-email') {
            router.replace('/confirm-email')
          }
          return
        }

        // ✅ ผ่านทุกเงื่อนไข
        if (pathname !== '/devtest') {
          router.replace('/devtest')
        }
      })

    return () => subscription.unsubscribe()
  }, [pathname])

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  )
}