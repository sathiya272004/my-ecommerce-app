import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { Colors } from '../../constants/Colors';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { db } from "../../firebase/config"; // Ensure correct path
import { getDoc, doc } from "firebase/firestore"; // Import getDoc and doc


export default function LoginScreen() {
  const router = useRouter();
  // const { signIn, isLoaded, setActive } = useSignIn();
  // const { setUserRole } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // const handleSignIn = async () => {
  //   if (!isLoaded) return;
    
  //   try {
  //     setLoading(true);
  //     setError('');
      
  //     // Start the sign-in process
  //     const signInAttempt = await signIn.create({
  //       identifier: email,
  //       password,
  //     });
      
  //     // Check if sign-in requires additional steps
  //     if (signInAttempt.status === 'complete') {
  //       await setActive({ session: signInAttempt.createdSessionId });
        
  //       // Determine user role (this would typically come from your backend)
  //       // For demo purposes, let's say admin@example.com is an admin
  //       if (email === 'admin@example.com') {
  //         setUserRole('admin');
  //         router.replace('/(admin)/dashboard');
  //       } else {
  //         setUserRole('customer');
  //         router.replace('/(tabs)/home');
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Error signing in:', err);
  //     setError('Invalid email or password');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  
  // const handleSignIn = async () => {
  //   setError('');
  //   console.log(email, password);
  
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //     const user = userCredential.user;
  //     console.log(user);
  
  //     // Navigate to dashboard and prevent going back to login
  //     router.replace('/dashboard');
  //   } catch (error) {
  //     console.error('Error signing in:', error);
  //     setError('Invalid email or password');
  //   }
  // };



const handleSignIn = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch Role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";

    if (role === "admin") {
      // window.location.href = "/dashboard";
      router.replace('/dashboard');
    } else {
      // window.location.href = "/home";
      router.replace('/home');
    }

  } catch (error) {
    console.error("Error signing in:", error.message);
  }
};
  

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>
        
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button 
            title="Sign In" 
            onPress={handleSignIn} 
            loading={loading}
            style={styles.button}
          />
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: Colors.PRIMARY,
  },
  button: {
    marginBottom: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
});