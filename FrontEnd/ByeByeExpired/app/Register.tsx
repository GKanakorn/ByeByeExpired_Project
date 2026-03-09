import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, ScrollView, Image } from "react-native";
import { supabase } from '../src/supabase';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { register, verifyGoogleProfile } from '../src/api/auth.api'
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Component หลักสำหรับหน้าลงทะเบียนสมาชิก
const RegisterScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
  if (!fullName || !email || !password || !confirmPassword) {
    Alert.alert("Error", "Please fill in all fields")
    return
  }

  if (!email.includes("@")) {
    Alert.alert("Error", "Please enter a valid email address")
    return
  }

  if (password !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match")
    return
  }

  try {
    await register({
      email,
      password,
      fullName,
    })

    Alert.alert(
      "Success",
      "Registration successful! กรุณายืนยันอีเมล",
      [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "/confirm-email",
              params: { email },
            }),
        },
      ]
    )
  } catch (err: any) {
    // ✅ ตรวจสอบว่าเป็น error เรื่อง email ซ้ำหรือไม่
    const errorMessage = err.message?.toLowerCase() || ''
    if (errorMessage.includes('already') || errorMessage.includes('exist') || errorMessage.includes('registered')) {
      Alert.alert(
        "Email Already Used",
        "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ"
      )
    } else {
      Alert.alert("Register failed", err.message)
    }
  }
}
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'byebyeexpired://login-callback',
      },
    });

    if (error) {
      Alert.alert('Google Login Error', error.message);
      return;
    }

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'byebyeexpired://login-callback'
      );
      
      if (result.type === 'success' && result.url) {
        console.log('[OAUTH] redirect url:', result.url);

        // 🔥 ดึง fragment หลัง #
        const fragment = result.url.split('#')[1];

        if (!fragment) {
          Alert.alert('Auth Error', 'ไม่พบ fragment จาก OAuth');
          return;
        }

        const params = new URLSearchParams(fragment);

        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          Alert.alert('Auth Error', 'ไม่พบ token จาก OAuth');
          return;
        }

        try {
          // ✅ Step 1: Save token for backend API calls
          await AsyncStorage.setItem('token', access_token)

          // ✅ Step 2: Verify/Create profile for Google OAuth
          await verifyGoogleProfile(access_token)
          console.log('[GOOGLE] Profile verified/created successfully')

          // ⏳ Step 3: Wait for database trigger to complete (locations creation)
          await new Promise(resolve => setTimeout(resolve, 2000))
          console.log('[GOOGLE] Waited for locations to be created')

          // ✅ Step 4: NOW set session to trigger LocationContext reload
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (sessionError) {
            Alert.alert('Session Error', sessionError.message)
            return
          }

          console.log('[GOOGLE] Session set and LocationContext reload triggered')

        } catch (err: any) {
          console.warn('[GOOGLE] Warning during profile verification:', err.message)
          // Still try to redirect even if there's a warning
          try {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            })
          } catch (e) {
            console.error('Failed to set session:', e)
          }
        }

        router.replace('/overview');
      }
    }
  };

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Function จัดการเมื่อ keyboard แสดงขึ้น - อัปเดต state เพื่อปรับ UI
  const handleKeyboardShow = (event: any) => {
    setIsKeyboardVisible(true);
  };

  // Function จัดการเมื่อ keyboard ซ่อน - อัปเดต state เพื่อปรับ UI กลับสู่ปกติ
  const handleKeyboardHide = (event: any) => {
    setIsKeyboardVisible(false);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined} 
        keyboardVerticalOffset={100}
      >
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.formContainer}>
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
            >
              <Text style={styles.headerText}>Create account</Text>
              
              {/* Google Login Button */}
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <Image 
                  source={require('../assets/images/google.png')} 
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Login with Google</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
              />
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 30,  
    left: 10, 
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 8,
    borderRadius: 15,
  },
  backButtonText: {
    fontSize: 14,
    color: "#6a367a", 
  },
  formContainer: {
    width: "100%",
    backgroundColor: "transparent",
    padding: 20,
    borderRadius: 80,
    marginTop: 280,
    paddingBottom: 30,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "#aa64aa",
    marginBottom: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
    resizeMode: 'contain',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(106, 54, 122, 0.3)',
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#6a367a',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: "#a64ca6",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e8b4e8",
  },
  button: {
    backgroundColor: "#ffe9f2",
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#a85a9a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: "#6a367a",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default RegisterScreen;
