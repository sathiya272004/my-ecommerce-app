import { View, Text, StyleSheet, Image, ScrollView } from "react-native"
import { Colors } from "../../constants/Colors"
import LoginForm from "../../components/auth/LoginForm"

export default function LoginScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.formContainer}>
        <LoginForm />
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
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
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
    marginBottom: 30,
  },
})

