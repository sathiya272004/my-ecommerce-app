"use client"

import { useState } from "react"
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native"
import { useRouter } from "expo-router"
import Input from "../ui/Input"
import Button from "../ui/Button"
import { useAuth } from "../../hooks/useAuth"
import { Colors } from "../../constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import { isValidEmail } from "../../utils/helpers"

const RegisterForm = () => {
  const router = useRouter()
  const { register, signInWithGoogle, signInWithFacebook } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!name) newErrors.name = "Name is required"

    if (!email) newErrors.email = "Email is required"
    else if (!isValidEmail(email)) newErrors.email = "Email is invalid"

    if (!password) newErrors.password = "Password is required"
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters"

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password"
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)
    const result = await register(email, password, name)
    setLoading(false)

    if (result.success) {
      Alert.alert("Success", "Registration successful!")
    } else {
      Alert.alert("Registration Failed", result.error)
    }
  }

  return (
    <View style={styles.container}>
      <Input
        label="Full Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        error={errors.name}
        autoCapitalize="words"
      />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        error={errors.email}
        autoCapitalize="none"
      />

      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a password"
        secureTextEntry
        error={errors.password}
      />

      <Input
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm your password"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button title="Register" onPress={handleRegister} loading={loading} style={styles.registerButton} fullWidth />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={signInWithGoogle}>
          <Ionicons name="logo-google" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]} onPress={signInWithFacebook}>
          <Ionicons name="logo-facebook" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  registerButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.BORDER,
  },
  dividerText: {
    marginHorizontal: 10,
    color: Colors.MUTED,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  facebookButton: {
    backgroundColor: "#4267B2",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: Colors.MUTED,
    fontSize: 16,
  },
  footerLink: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RegisterForm

