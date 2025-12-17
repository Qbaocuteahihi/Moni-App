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
import Animated, { FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase(),
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email: email.toLowerCase(),
        role: "user",
        createdAt: serverTimestamp(),
      });

    } catch (error) {
      console.error("Signup error:", error);
      
      let errorMessage = "Signup failed. Please try again.";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email already in use";
          setErrors({ email: "Email already in use" });
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          setErrors({ email: "Invalid email address" });
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Operation not allowed";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          setErrors({ password: "Password is too weak" });
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Check your connection";
          break;
        default:
          errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
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
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
        >
          {/* Back Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 50 : 40,
              left: 20,
              zIndex: 10,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Main Content */}
          <View style={{ 
            flex: 1, 
            justifyContent: "space-between",
            paddingHorizontal: 25,
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            paddingBottom: Platform.OS === "ios" ? 40 : 30
          }}>
            
            {/* Top Section - Title */}
            <View style={{ alignItems: "center", marginTop: 40 }}>
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
                Create Account
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.delay(200).duration(1000)}
                style={{
                  fontSize: 16,
                  color: "rgba(255, 255, 255, 0.8)",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                Join our community today
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
                <View style={{
                  backgroundColor: "#FFF5F5",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: "#F56565",
                }}>
                  <Text style={{ color: "#C53030", fontSize: 14 }}>
                    {errors.general}
                  </Text>
                </View>
              )}

              {/* Username Field */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  color: "#4A5568", 
                  fontSize: 14, 
                  fontWeight: "600",
                  marginBottom: 8,
                  marginLeft: 5 
                }}>
                  Username
                </Text>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F7FAFC",
                  borderRadius: 12,
                  paddingHorizontal: 15,
                  borderWidth: errors.username ? 2 : 1,
                  borderColor: errors.username ? "#FC8181" : "#E2E8F0",
                }}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={errors.username ? "#FC8181" : "#718096"} 
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    placeholder="Choose a username"
                    placeholderTextColor="#A0AEC0"
                    style={{
                      flex: 1,
                      paddingVertical: 15,
                      fontSize: 16,
                      color: "#2D3748",
                    }}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) setErrors({ ...errors, username: "" });
                      if (errors.general) setErrors({});
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.username && (
                  <Text style={{
                    color: "#FC8181",
                    fontSize: 12,
                    marginTop: 6,
                    marginLeft: 5,
                  }}>
                    {errors.username}
                  </Text>
                )}
              </View>

              {/* Email Field */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  color: "#4A5568", 
                  fontSize: 14, 
                  fontWeight: "600",
                  marginBottom: 8,
                  marginLeft: 5 
                }}>
                  Email
                </Text>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F7FAFC",
                  borderRadius: 12,
                  paddingHorizontal: 15,
                  borderWidth: errors.email ? 2 : 1,
                  borderColor: errors.email ? "#FC8181" : "#E2E8F0",
                }}>
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
                  <Text style={{
                    color: "#FC8181",
                    fontSize: 12,
                    marginTop: 6,
                    marginLeft: 5,
                  }}>
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Field */}
              <View style={{ marginBottom: 30 }}>
                <Text style={{ 
                  color: "#4A5568", 
                  fontSize: 14, 
                  fontWeight: "600",
                  marginBottom: 8,
                  marginLeft: 5 
                }}>
                  Password
                </Text>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F7FAFC",
                  borderRadius: 12,
                  paddingHorizontal: 15,
                  borderWidth: errors.password ? 2 : 1,
                  borderColor: errors.password ? "#FC8181" : "#E2E8F0",
                }}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={errors.password ? "#FC8181" : "#718096"} 
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    placeholder="At least 6 characters"
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
                      if (errors.password) setErrors({ ...errors, password: "" });
                      if (errors.general) setErrors({});
                    }}
                  />
                </View>
                {errors.password && (
                  <Text style={{
                    color: "#FC8181",
                    fontSize: 12,
                    marginTop: 6,
                    marginLeft: 5,
                  }}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: loading ? "#90CDF4" : "#3182CE",
                  borderRadius: 12,
                  paddingVertical: 18,
                  alignItems: "center",
                  shadowColor: "#3182CE",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                }}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}>
                <Text style={{ 
                  color: "#718096", 
                  fontSize: 15 
                }}>
                  Already have an account?
                </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Login")}
                  style={{ marginLeft: 5 }}
                >
                  <Text style={{
                    color: "#3182CE",
                    fontSize: 15,
                    fontWeight: "bold",
                  }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Bottom Info */}
            <View style={{ alignItems: "center" }}>
              <Text style={{ 
                color: "rgba(255, 255, 255, 0.7)", 
                fontSize: 12,
                textAlign: "center"
              }}>
                By signing up, you agree to our Terms of Service
              </Text>
              <Text style={{ 
                color: "rgba(255, 255, 255, 0.7)", 
                fontSize: 12,
                marginTop: 5
              }}>
                and Privacy Policy
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}