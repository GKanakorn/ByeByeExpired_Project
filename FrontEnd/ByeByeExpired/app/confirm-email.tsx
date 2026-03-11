import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { supabase } from '../src/supabase'
import { confirmAndCreateProfile } from '../src/api/auth.api'
import { router, useLocalSearchParams } from 'expo-router'
import { useRef, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const normalizedEmail = typeof email === 'string'
    ? email.trim().toLowerCase()
    : ''

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  const inputs = useRef<(TextInput | null)[]>([])


  useEffect(() => {
    if (!normalizedEmail) {
      Alert.alert('Error', 'Email not found from registration')
      router.replace('/Register')
    }
  }, [normalizedEmail])

  useEffect(() => {
    if (otp.every((d) => d !== '')) {
      handleVerify(otp.join(''))
    }
  }, [otp])

  const maskEmail = (value: string) => {
    const [name, domain] = value.split('@')
    return `${name.slice(0, 2)}***@${domain}`
  }

  const updateOtp = (val: string, idx: number) => {
    const next = [...otp]
    next[idx] = val
    setOtp(next)
  }

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '')
    if (!clean) {
      updateOtp('', index)
      return
    }

    // paste หลายตัว
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const next = [...otp]

      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c
      })

      setOtp(next)
      return
    }

    updateOtp(clean, index)
    if (index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index]) {
        updateOtp('', index)
      } else if (index > 0) {
        inputs.current[index - 1]?.focus()
        updateOtp('', index - 1)
      }
    }
  }

  const handleVerify = async (code: string) => {
    if (!normalizedEmail || code.length !== 6) return

    setLoading(true)
    const { error, data } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: code,
      type: 'signup',
    })
    
    if (error) {
      setLoading(false)
      Alert.alert('Error', 'Invalid or expired OTP')
      return
    }

    try {
      // ✅ Get user info from session
      const user = data.user
      if (!user) {
        throw new Error('User not found after OTP verification')
      }

      console.log('[OTP VERIFIED] UID:', user.id)

      // ✅ Call backend to create profile + locations
      const fullName = user.user_metadata?.full_name || normalizedEmail.split('@')[0]
      await confirmAndCreateProfile({
        userId: user.id,
        email: user.email || normalizedEmail,
        fullName,
      })

      console.log('[PROFILE CREATED] Profile created successfully')

      // ⏳ Wait for database trigger to complete (locations creation)
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('[OTP] Waited for locations to be created')

      // ✅ Save token and set session for future API calls
      if (data.session) {
        await AsyncStorage.setItem('token', data.session.access_token)
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      setLoading(false)
      router.replace('/overview')
    } catch (err: any) {
      setLoading(false)
      console.error('Error creating profile:', err)
      Alert.alert('Error', err.message || 'Failed to create profile')
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || !normalizedEmail || resending) return

    try {
      setResending(true)

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: 'byebyeexpired://login-callback',
        },
      })

      if (error) {
        throw error
      }

      Alert.alert('Success', 'OTP resent. Please check your email')
      setCooldown(30)
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (err: any) {
      Alert.alert('Failed to resend OTP', err?.message || 'Please try again')
    } finally {
      setResending(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#6a367a" />
          </TouchableOpacity>
          <View style={styles.card}>
            <Text style={styles.title}>Confirm Email</Text>

        <Text style={styles.emailText}>
          Code sent to {normalizedEmail && maskEmail(normalizedEmail)}
        </Text>

        <View style={styles.otpRow}>
            {otp.map((digit, i) => (
            <TextInput
                key={i}
                ref={(el) => {
                inputs.current[i] = el
                }}
                style={[
                styles.otpBox,
                digit && styles.otpFilled,
                ]}
                keyboardType="number-pad"
                value={digit}
                maxLength={i === 0 ? 6 : 1}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                autoFocus={i === 0}
            />
            ))}
        </View>

        <TouchableOpacity disabled={loading} style={styles.verifyButton}>
            <Text style={styles.verifyText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
        </TouchableOpacity>

            <TouchableOpacity disabled={cooldown > 0 || resending} onPress={handleResend}>
              <Text style={styles.resendText}>
                {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

const PRIMARY = '#6a367a'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f2f8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: PRIMARY,
  },
  emailText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 28,
    color: '#555',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#fafafa',
  },
  otpFilled: {
    borderColor: PRIMARY,
    backgroundColor: '#f4ecf7',
  },
  verifyButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendText: {
    textAlign: 'center',
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
})