import { useSignIn, useOAuth, useAuth } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import React, { useState } from 'react'

export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}
import { Ionicons } from '@expo/vector-icons'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormTextField from '../shared/FormTextField'

export default function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)')
    }
  }, [isSignedIn])

  const schema = z.object({
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })

  type FormValues = z.infer<typeof schema>

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const { handleSubmit } = methods

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  // Warm up browser for better UX
  useWarmUpBrowser();

  const onGoogleSignInPress = React.useCallback(async () => {
    try {
      // Create a redirect URI that points to the root of the app
      const redirectUrl = Linking.createURL('oauth_callback');
      console.log("Starting OAuth flow with redirect:", redirectUrl);

      const { createdSessionId, setActive, signUp, signIn } = await startOAuthFlow({
        redirectUrl,
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

  const onSignInPress = async (data: FormValues) => {
    if (!isLoaded) {
      return
    }
    setLoading(true)

    try {
      const signInAttempt = await signIn.create({
        identifier: data.email,
        password: data.password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(tabs)')
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        // console.error(JSON.stringify(signInAttempt, null, 2))
        alert('Login incomplete. Please check your verification status.')
      }
    } catch (err: any) {
      // console.error(JSON.stringify(err, null, 2))
      if (err.errors?.[0]?.code === 'session_already_exists') {
        router.replace('/(tabs)')
        return
      }
      alert(err.errors?.[0]?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#008080', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="fitness" size={40} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>InfinityHealth</Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>Welcome back! Please login to continue</Text>
        </View>

        <FormProvider {...methods}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <FormTextField name="email" placeholder="Enter your email" style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }} />
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, height: 48 }}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <FormTextField name="password" placeholder="Enter your password" secureTextEntry={!showPassword} style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#1F2937' }} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit(onSignInPress)} style={{ backgroundColor: '#008080', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Login</Text>}
          </TouchableOpacity>

          {/* Social Login Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            <Text style={{ marginHorizontal: 10, color: '#6B7280', fontSize: 14 }}>or continue with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            onPress={onGoogleSignInPress}
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
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{ color: '#008080', fontSize: 14, fontWeight: '600' }}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </FormProvider>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
