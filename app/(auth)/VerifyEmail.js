import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function VerifyEmail() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!isLoaded) return;
    if (!code) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // ✅ Verify the email using the code
      await signUp.attemptEmailAddressVerification({ code });

      // ✅ After successful verification, sign in the user
      const signInAttempt = await signUp.createNewSession();
      await setActive({ session: signInAttempt.createdSessionId });

      // ✅ Navigate to home screen after login
      router.replace('/(tabs)/home');
    } catch (err) {
      console.error('Error verifying email:', err);
      setError(err.errors ? err.errors[0].message : 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button title="Verify" onPress={handleVerify} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  errorText: { color: 'red', textAlign: 'center' },
});
