import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Platform, 
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterPage } from '../hook/useRegisterPage';

interface RegisterPageProps {}

const RegisterPage: React.FC<RegisterPageProps> = () => {
  const controller = useRegisterPage();

  return (
    <KeyboardAvoidingView 
      style={controller.styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={controller.handleBack}
        style={controller.styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color="#1F2937" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={controller.styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Header */}
        <View style={controller.styles.logoContainer}>
          <View style={controller.styles.logoBox}>
            <Ionicons name="person-add" size={40} color="#FFFFFF" />
          </View>
          <Text style={controller.styles.title}>Create Account</Text>
          <Text style={controller.styles.subtitle}>
            Sign up to start your health journey
          </Text>
        </View>

        {/* Full Name Input */}
        <View style={controller.styles.inputWrapper}>
          <Text style={controller.styles.inputLabel}>Full Name</Text>
          <View style={controller.styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={controller.fullName}
              onChangeText={controller.setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              style={controller.styles.input}
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={controller.styles.inputWrapper}>
          <Text style={controller.styles.inputLabel}>Email</Text>
          <View style={controller.styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={controller.email}
              onChangeText={controller.setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={controller.styles.input}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={controller.styles.inputWrapper}>
          <Text style={controller.styles.inputLabel}>Password</Text>
          <View style={controller.styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={controller.password}
              onChangeText={controller.setPassword}
              placeholder="Create a password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!controller.showPassword}
              style={controller.styles.input}
            />
            <TouchableOpacity onPress={controller.toggleShowPassword}>
              <Ionicons 
                name={controller.showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={controller.styles.inputLabel}>Confirm Password</Text>
          <View style={controller.styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={controller.confirmPassword}
              onChangeText={controller.setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!controller.showConfirmPassword}
              style={controller.styles.input}
            />
            <TouchableOpacity onPress={controller.toggleShowConfirmPassword}>
              <Ionicons 
                name={controller.showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms & Conditions */}
        <TouchableOpacity 
          onPress={controller.toggleAgreeTerms}
          style={controller.styles.termsContainer}
        >
          <View style={[
            controller.styles.checkbox,
            controller.agreeTerms 
              ? controller.styles.checkboxChecked 
              : controller.styles.checkboxUnchecked
          ]}>
            {controller.agreeTerms && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
          <Text style={controller.styles.termsText}>
            I agree to the{' '}
            <Text style={controller.styles.termsLink}>Terms & Conditions</Text>
            {' '}and{' '}
            <Text style={controller.styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          onPress={controller.handleRegister}
          disabled={controller.isLoading}
          style={controller.styles.registerButton}
        >
          {controller.isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={controller.styles.registerButtonText}>
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={controller.styles.dividerContainer}>
          <View style={controller.styles.dividerLine} />
          <Text style={controller.styles.dividerText}>or</Text>
          <View style={controller.styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={controller.styles.socialContainer}>
          <TouchableOpacity style={controller.styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={controller.styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={controller.styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={controller.styles.loginContainer}>
          <Text style={controller.styles.loginText}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={controller.handleLogin}>
            <Text style={controller.styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterPage;
