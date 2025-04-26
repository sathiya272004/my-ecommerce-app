;("use client")

import { View, Text, StyleSheet, Image, ScrollView } from "react-native"
import { Colors } from "../../constants/Colors"
import RegisterForm from "../../components/auth/RegisterForm"

export default function RegisterScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
      </View>

      <View style={styles.formContainer}>
        <RegisterForm />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.BACKGROUND,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.TEXT,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.MUTED,
  },
  formContainer: {
    marginBottom: 20,
  },
})

