import { useState, useEffect } from "react";
import { StyleSheet, Platform, Alert } from "react-native";
import { router } from "expo-router";
import storage from "../utils/storage";
import { HealthCheckResponse, LoginResponse } from "../interface/infinityhealth.interface";
import { getHealthCheck, login } from "../service/InfinityhealthApi";
import { z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
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
    },
    healthCheckButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    healthCheckText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    healthStatusSuccess: {
        backgroundColor: '#D1FAE5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    healthStatusError: {
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    healthStatusTextSuccess: {
        color: '#065F46',
        fontSize: 14,
        textAlign: 'center',
    },
    healthStatusTextError: {
        color: '#991B1B',
        fontSize: 14,
        textAlign: 'center',
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#7DD1E0',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#7DD1E0',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    loginButtonText: {
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
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    signUpText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signUpLink: {
        color: '#7DD1E0',
        fontSize: 14,
        fontWeight: '600',
    },
});

export const useLoginPage = () => {
    // const [email, setEmail] = useState('');
    // const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [healthStatus, setHealthStatus] = useState<string | null>(null);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

    const documentSchema = z.object({
        email: z.string().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required'),
    });

    type FormValues = z.infer<typeof documentSchema>;

    const methods: UseFormReturn<FormValues> = useForm<FormValues>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'all'
    });

    const {control, handleSubmit, formState, watch, reset, setValue} = methods;

    const onSubmit = (data: FormValues) => {
        console.log('data ', data)
        handleLogin()
    }

    const onError = (errors: any) => {
        console.log('errors ', errors)
    }

    // Health Check API on page mount
    const getHealthCheckApi = async () => {
        if (isPageLoading) return;
        setIsPageLoading(true);

        try {
            const res: HealthCheckResponse = await getHealthCheck();
            if (res) {
                console.log('[LoginPage] Health check response:', res.status);
                setHealthStatus(`✅ ${res.status}: ${res.message}`);
            }
        } catch (error) {
            console.error('[LoginPage] Error fetching health check:', error);
            setHealthStatus(`❌ Error: Server is not responding`);
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => {
        getHealthCheckApi();
    }, []);

    // Manual Health Check (with alert)
    const handleHealthCheck = async () => {
        setIsLoading(true);
        try {
            const result: HealthCheckResponse = await getHealthCheck();
            setHealthStatus(`✅ ${result.status}: ${result.message}`);
            const message = `Health Check Success!\nStatus: ${result.status}\nMessage: ${result.message}\nUptime: ${result.uptime.toFixed(2)}s`;
            Platform.OS === 'web' ? alert(message) : Alert.alert('Health Check Success!', message);
        } catch (error: any) {
            setHealthStatus(`❌ Error: ${error.message}`);
            const message = `Health Check Failed!\n${error.message}`;
            Platform.OS === 'web' ? alert(message) : Alert.alert('Health Check Failed!', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        // if (!email || !password) {
        //     const message = 'Please fill in all fields';
        //     Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
        //     return;
        // }

        setIsLoading(true);
        
        try {
            const response: LoginResponse = await login({ email: watch('email'), password: watch('password') });
            console.log('res ', response)
            
            if (response.success && response.user) {
                // Store user data in storage
                await storage.setItem('userId', response.user.userId);
                await storage.setItem('userEmail', response.user.email);
                await storage.setItem('userFullName', response.user.fullName);
                if (response.token) {
                    await storage.setItem('token', response.token);
                }
                
                console.log('[LoginPage] Login successful, userId stored:', response.user.userId);
                
                router.replace('/(tabs)');
            } else {
                const message = response.message || 'Login failed';
                Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
            }
        } catch (error: any) {
            console.error('[LoginPage] Login error:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Platform.OS === 'web' ? alert(message) : Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        router.push('/(auth)/register');
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return {
        styles,

        showPassword,
        toggleShowPassword,
        isLoading,
        isPageLoading,
        healthStatus,
        handleHealthCheck,
        handleLogin,
        handleSignUp,
        methods,
        watch,
        onSubmit,
        onError,
    };
};

export type IuseLoginPage = ReturnType<typeof useLoginPage>;
