import { useState, useEffect } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { router } from "expo-router";
import storage from "../utils/storage";
import { HealthCheckResponse, RegisterResponse } from "../interface/infinityhealth.interface";
import { getHealthCheck, register } from "../service/InfinityhealthApi";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        zIndex: 10,
        padding: 8,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#7DD1E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1F2937',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxUnchecked: {
        borderColor: '#D1D5DB',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        borderColor: '#7DD1E0',
        backgroundColor: '#7DD1E0',
    },
    termsText: {
        color: '#6B7280',
        fontSize: 14,
        flex: 1,
    },
    termsLink: {
        color: '#7DD1E0',
        fontWeight: '500',
    },
    registerButton: {
        backgroundColor: '#7DD1E0',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    loginText: {
        color: '#6B7280',
        fontSize: 14,
    },
    loginLink: {
        color: '#7DD1E0',
        fontSize: 14,
        fontWeight: '600',
    },
});

export const useRegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
    const [healthStatus, setHealthStatus] = useState<string | null>(null);

    // Health Check API on page mount
    const getHealthCheckApi = async () => {
        if (isPageLoading) return;
        setIsPageLoading(true);

        try {
            const res: HealthCheckResponse = await getHealthCheck();
            if (res) {
                console.log('[RegisterPage] Health check response:', res.status);
                setHealthStatus(`✅ ${res.status}: ${res.message}`);
            }
        } catch (error) {
            console.error('[RegisterPage] Error fetching health check:', error);
            setHealthStatus(`❌ Error: Server is not responding`);
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => {
        getHealthCheckApi();
    }, []);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            const message = 'Please fill in all fields';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
            return;
        }

        if (password !== confirmPassword) {
            const message = 'Passwords do not match';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
            return;
        }

        if (!agreeTerms) {
            const message = 'Please agree to Terms & Conditions';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
            return;
        }

        setIsLoading(true);
        
        try {
            const response: RegisterResponse = await register({ fullName, email, password });
            
            if (response.success && response.user) {
                // Store userId and token in storage (works on both web and native)
                await storage.setItem('userId', response.user.id);
                await storage.setItem('userEmail', response.user.email);
                await storage.setItem('userFullName', response.user.fullName);
                if (response.token) {
                    await storage.setItem('token', response.token);
                }
                
                console.log('[RegisterPage] Registration successful, userId stored:', response.user.id);
                
                const message = 'Registration successful!';
                Platform.OS === 'web' ? alert(message) : Alert.alert('Success', message);
                router.replace('/(auth)/login');
            } else {
                const message = response.message || 'Registration failed';
                Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
            }
        } catch (error: any) {
            console.error('[RegisterPage] Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleLogin = () => {
        router.push('/(auth)/login');
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const toggleAgreeTerms = () => {
        setAgreeTerms(!agreeTerms);
    };

    return {
        styles,
        fullName,
        setFullName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        toggleShowPassword,
        showConfirmPassword,
        toggleShowConfirmPassword,
        isLoading,
        isPageLoading,
        healthStatus,
        agreeTerms,
        toggleAgreeTerms,
        handleRegister,
        handleBack,
        handleLogin,
    };
};

export type IuseRegisterPage = ReturnType<typeof useRegisterPage>;
