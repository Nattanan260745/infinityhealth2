import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLoginPage } from '../hook/useLoginPage';
import FormTextField from '../shared/FormTextField';
import { FormProvider } from 'react-hook-form';


interface LoginPageProps { }

const LoginPage: React.FC<LoginPageProps> = () => {
  const controller = useLoginPage();

  
  

  return (
    <KeyboardAvoidingView
      style={controller.styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={controller.styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Header */}
        <View style={controller.styles.logoContainer}>
          <View style={controller.styles.logoBox}>
            <Ionicons name="fitness" size={40} color="#FFFFFF" />
          </View>
          <Text style={controller.styles.title}>InfinityHealth</Text>
          <Text style={controller.styles.subtitle}>
            Welcome back! Please login to continue
          </Text>
        </View>
        <FormProvider {...controller.methods}>
          <form onSubmit={controller.methods.handleSubmit(controller.onSubmit, controller.onError)}>

            {/* Email Input */}

            <View style={{ marginBottom: 16 }}>
              <Text style={controller.styles.inputLabel}>Email</Text>
              <View style={controller.styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                {/* <TextInput
              value={controller.email}
              onChangeText={controller.setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={controller.styles.input}
            /> */}
                <FormTextField name={'email'} placeholder='Enter your email' />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={controller.styles.inputLabel}>Password</Text>
              <View style={controller.styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                {/* <TextInput
                  value={controller.password}
                  onChangeText={controller.setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!controller.showPassword}
                  style={controller.styles.input}
                /> */}
                    <FormTextField name={'password'} placeholder='Enter your password' />
                <TouchableOpacity onPress={controller.toggleShowPassword}>
                  <Ionicons
                    name={controller.showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={controller.styles.forgotPassword}>
              <Text style={controller.styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={controller.methods.handleSubmit(controller.onSubmit, controller.onError)}
              style={controller.styles.loginButton}
            >
              <Text style={controller.styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={controller.styles.signUpContainer}>
              <Text style={controller.styles.signUpText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={controller.handleSignUp}>
                <Text style={controller.styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </form>
        </FormProvider>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
