import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log("Mã lỗi Firebase:", error.code);

      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      let fieldError = {};

      // Kiểm tra format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(email);

      if (!isValidEmail) {
        // Format email sai
        errorMessage = "Định dạng email không hợp lệ";
        fieldError = { email: "Vui lòng nhập đúng định dạng email" };
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        // Phương án 1: Chỉ báo lỗi ở password với message chung
        errorMessage = "Thông tin đăng nhập không đúng";
        fieldError = {
          password: "Vui lòng kiểm tra email và mật khẩu",
        };
      } else if (error.code === "auth/user-not-found") {
        // Nếu Firebase trả về lỗi này (phiên bản cũ)
        errorMessage = "Email không tồn tại";
        fieldError = { email: "Email không tồn tại trong hệ thống" };
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Định dạng email không hợp lệ";
        fieldError = { email: "Vui lòng nhập đúng định dạng email" };
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Quá nhiều lần thử sai. Vui lòng thử lại sau ít phút";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Tài khoản đã bị vô hiệu hóa";
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Phương thức đăng nhập này không được hỗ trợ";
      } else {
        errorMessage = "Lỗi đăng nhập: " + (error.message || "Không xác định");
      }

      setErrors({
        ...fieldError,
        general: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Background */}
        <Image
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
          source={require("../assets/background.png")}
        />

        {/* Animated Lights */}
        <View style={{ position: "absolute", width: "100%", top: 50 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Animated.Image
              entering={FadeInUp.delay(200).duration(1000)}
              style={{ height: 200, width: 80, opacity: 0.8 }}
              source={require("../assets/light.png")}
            />
            <Animated.Image
              entering={FadeInUp.delay(400).duration(1000)}
              style={{ height: 150, width: 60, opacity: 0.8 }}
              source={require("../assets/light.png")}
            />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          {/* Main Content */}
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              paddingHorizontal: 25,
              paddingTop: Platform.OS === "ios" ? 60 : 40,
              paddingBottom: Platform.OS === "ios" ? 40 : 30,
            }}
          >
            {/* Top Section - Title */}
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Animated.Text
                entering={FadeInUp.duration(1000)}
                style={{
                  fontSize: 42,
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  textShadowColor: "rgba(0, 0, 0, 0.3)",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 5,
                }}
              >
                Welcome to Moni
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(200).duration(1000)}
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.8)",
                  marginTop: 10,
                }}
              >
                Sign in to continue
              </Animated.Text>
            </View>

            {/* Form Section */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(1000)}
              style={{
                backgroundColor: "white",
                borderRadius: 25,
                padding: 25,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 10,
                marginBottom: Platform.OS === "ios" ? 20 : 0,
              }}
            >
              {/* General Error */}
              {errors.general && (
                <View
                  style={{
                    backgroundColor: "#FFF5F5",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: "#F56565",
                  }}
                >
                  <Text style={{ color: "#C53030", fontSize: 14 }}>
                    {errors.general}
                  </Text>
                </View>
              )}

              {/* Email Field */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: "#4A5568",
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 5,
                  }}
                >
                  Email
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F7FAFC",
                    borderRadius: 12,
                    paddingHorizontal: 15,
                    borderWidth: errors.email ? 2 : 1,
                    borderColor: errors.email ? "#FC8181" : "#E2E8F0",
                  }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={errors.email ? "#FC8181" : "#718096"}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#A0AEC0"
                    style={{
                      flex: 1,
                      paddingVertical: 15,
                      fontSize: 16,
                      color: "#2D3748",
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text.toLowerCase());
                      if (errors.email) setErrors({ ...errors, email: "" });
                      if (errors.general) setErrors({});
                    }}
                  />
                </View>
                {errors.email && (
                  <Text
                    style={{
                      color: "#FC8181",
                      fontSize: 12,
                      marginTop: 6,
                      marginLeft: 5,
                    }}
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Field */}
              <View style={{ marginBottom: 30 }}>
                <Text
                  style={{
                    color: "#4A5568",
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 5,
                  }}
                >
                  Password
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F7FAFC",
                    borderRadius: 12,
                    paddingHorizontal: 15,
                    borderWidth: errors.password ? 2 : 1,
                    borderColor: errors.password ? "#FC8181" : "#E2E8F0",
                  }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={errors.password ? "#FC8181" : "#718096"}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#A0AEC0"
                    secureTextEntry
                    style={{
                      flex: 1,
                      paddingVertical: 15,
                      fontSize: 16,
                      color: "#2D3748",
                    }}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password)
                        setErrors({ ...errors, password: "" });
                      if (errors.general) setErrors({});
                    }}
                  />
                </View>
                {errors.password && (
                  <Text
                    style={{
                      color: "#FC8181",
                      fontSize: 12,
                      marginTop: 6,
                      marginLeft: 5,
                    }}
                  >
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: isLoading ? "#90CDF4" : "#3182CE",
                  borderRadius: 12,
                  paddingVertical: 18,
                  alignItems: "center",
                  shadowColor: "#3182CE",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 25,
                }}
              >
                <Text
                  style={{
                    color: "#718096",
                    fontSize: 15,
                  }}
                >
                  Don't have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("SignUp")}
                  style={{ marginLeft: 5 }}
                >
                  <Text
                    style={{
                      color: "#3182CE",
                      fontSize: 15,
                      fontWeight: "bold",
                    }}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Bottom Info */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                By continuing, you agree to our Terms of Service
              </Text>
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                and Privacy Policy
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
