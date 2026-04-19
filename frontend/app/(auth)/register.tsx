import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import FormTextField from '../../shared/FormTextField';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function RegisterPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0); // Countdown state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Countdown timer effect
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCountdown]);

  // Schema for Sign Up Form
  const signUpSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm Password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  type SignUpFormValues = z.infer<typeof signUpSchema>;

  const methods = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const { handleSubmit } = methods;

  const onSignUpPress = async (data: SignUpFormValues) => {
    if (!isLoaded) return;
    setIsLoading(true);

    if (!agreeTerms) {
      alert("Please agree to the Terms & Conditions");
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      setResendCountdown(20); // Start countdown immediately upon landing on verify screen
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        alert(`Verification incomplete.\nStatus: ${completeSignUp.status}\nMissing: ${JSON.stringify(completeSignUp.missingFields)}`);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // Check for specific error codes
      const errorCode = err.errors?.[0]?.code;
      const errorMessage = err.errors?.[0]?.message;

      if (errorCode === 'verification_already_verified' || errorMessage === 'already verified') {
        if (signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId });
          router.replace('/');
          return;
        }
        alert('Email already verified. Please login.');
        router.replace('/(auth)/login');
      } else {
        alert(errorMessage || 'Verification failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResendPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendCountdown(20); // Start 20s countdown
      alert('Verification code resent! Please check your email.');
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      alert(err.errors?.[0]?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onGoogleSignUpPress = React.useCallback(async () => {
    try {
      const redirectUrl = Linking.createURL('oauth_callback');
      console.log("Starting OAuth (SignUp) flow with redirect:", redirectUrl);

      const { createdSessionId, setActive, signUp, signIn } = await startOAuthFlow({
        redirectUrl
      });

      if (createdSessionId) {
        console.log("OAuth success, creating session:", createdSessionId);
        setActive!({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
        console.log("OAuth flow incomplete, next steps required.");
      }
    } catch (err: any) {
      console.error("OAuth error", JSON.stringify(err, null, 2));
      alert(`Google Login Failed: ${err.message || JSON.stringify(err)}`);
    }
  }, []);

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Ionicons name="mail-unread-outline" size={64} color="#008080" />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 16 }}>Verify your Email</Text>
            <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
              We sent a verification code to your email. Please enter it below.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 24 }}>
            <Ionicons name="key-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="Enter Verification Code"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }}
            />
          </View>

          <TouchableOpacity
            onPress={onPressVerify}
            style={{ backgroundColor: '#008080', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Verify Email</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onResendPress}
            disabled={isLoading || resendCountdown > 0}
            style={{ marginTop: 16, alignItems: 'center', padding: 10 }}
          >
            <Text style={{ fontSize: 14, color: resendCountdown > 0 ? '#9CA3AF' : '#008080', fontWeight: '600' }}>
              {resendCountdown > 0 ? `Resend Code in ${resendCountdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 50, left: 24, zIndex: 10 }}>
        <Ionicons name="chevron-back" size={28} color="#1F2937" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#008080', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="person-add" size={32} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>Create Account</Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>Sign up to start your health journey</Text>
        </View>

        <FormProvider {...methods}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 0.48 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>First Name</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
                <FormTextField name="firstName" placeholder="First Name" style={{ flex: 1, fontSize: 16, color: '#1F2937' }} />
              </View>
            </View>
            <View style={{ flex: 0.48 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Last Name</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
                <FormTextField name="lastName" placeholder="Last Name" style={{ flex: 1, fontSize: 16, color: '#1F2937' }} />
              </View>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <FormTextField name="email" placeholder="Enter your email" style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }} />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <FormTextField name="password" placeholder="Create a password" secureTextEntry={!showPassword} style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Confirm Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <FormTextField name="confirmPassword" placeholder="Confirm your password" secureTextEntry={!showConfirmPassword} style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>


          {/* Terms and Conditions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity onPress={() => setAgreeTerms(!agreeTerms)} style={{ marginRight: 12 }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: agreeTerms ? '#008080' : '#D1D5DB',
                backgroundColor: agreeTerms ? '#008080' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {agreeTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
            <Text style={{ flex: 1, color: '#6B7280', fontSize: 14 }}>
              I agree to the <Text style={{ color: '#008080', fontWeight: '600' }}>Terms & Conditions</Text> and <Text style={{ color: '#008080', fontWeight: '600' }}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={handleSubmit(onSignUpPress)} style={{ backgroundColor: '#008080', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Create Account</Text>}
          </TouchableOpacity>

          {/* Social Login Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            <Text style={{ marginHorizontal: 10, color: '#6B7280', fontSize: 14 }}>or continue with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            onPress={onGoogleSignUpPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 12,
              height: 48,
              marginBottom: 24
            }}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Google</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={{ color: '#008080', fontSize: 14, fontWeight: '600' }}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Captcha Container for Web */}
          <View nativeID="clerk-captcha" />
        </FormProvider>
      </ScrollView >
    </KeyboardAvoidingView >
  );
}
