import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Platform, Image } from "react-native";
import { login } from '../src/api/auth.api'
import { supabase } from '../src/supabase'
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ฟังก์ชันสำหรับการ Login
  const handleLogin = async () => {
    try {
      const data = await login({ email, password })

      // เอา token ไป set ให้ supabase client
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })

      router.replace('/devtest')
    } catch (err: any) {
      Alert.alert('Login failed', err.message)
    }
  }

  // State สำหรับตรวจสอบว่าคีย์บอร์ดแสดงอยู่หรือไม่
  const [isKeyboardVisible , setIsKeyboardVisible] = useState(false);

  // ฟังก์ชันเมื่อคีย์บอร์ดแสดง
  const handleKeyboardShow = () => {
    setIsKeyboardVisible(true);
  };

  // ฟังก์ชันเมื่อคีย์บอร์ดซ่อน
  const handleKeyboardHide = () => {
    setIsKeyboardVisible(false);
  };

  // ใช้ useEffect เพื่อเพิ่มและลบ event listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardHide);

    // ลบ listeners เมื่อ component unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    // TouchableWithoutFeedback สำหรับ dismiss คีย์บอร์ดเมื่อคลิกที่พื้นหลัง
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {/* KeyboardAvoidingView สำหรับจัดการ layout เมื่อคีย์บอร์ดแสดง */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {/* ImageBackground สำหรับพื้นหลังของหน้า Login */}
        <ImageBackground source={require("../assets/images/background.jpg")} style={styles.container}>
          <Text style={styles.title}>Log In</Text>
          {/* Form สำหรับกรอกข้อมูล Login */}
          <View style={styles.formContainer}>
            {/* Google Login Button */}
            <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert('Google Login', 'Google login coming soon!')}>
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

            {/* Email */}
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
{/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {/* ปุ่มสำหรับ Login */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Don’t have an account yet?{" "}
              {/* ปุ่มสำหรับ register */}
              <Text
                style={styles.signUpText}
                onPress={() => router.push("/Register")}
              >
                Create an account
              </Text>
            </Text>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    color: "#aa64aa",
    fontWeight: "600",
    marginBottom: 10,
  },
  firstSubtitle: {
    fontSize: 16,
    textAlign: "left",
    color: "#d59ac5",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "left",
    color: "#d59ac5",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 15,
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
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f1d4e4",
  },
  button: {
    backgroundColor: "#ffe9f2",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#6a367a",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 15,
    textAlign: "center",
    color: "#6a367a",
  },
  signUpText: {
    color: "#e81b7e",
    fontWeight: "bold",
  },
});
