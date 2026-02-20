import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../../types';

// Types
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (credentials: any) => Promise<any>;
    register: (userData: any) => Promise<any>;
    logout: () => Promise<void>;
    updateUser: (userData: User) => void;
    clearError: () => void;
    loginWithSocial: (provider: string, token: string, userData?: any) => Promise<any>;
}

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Action types
enum AuthActionType {
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGOUT = 'LOGOUT',
    REGISTER_SUCCESS = 'REGISTER_SUCCESS',
    SET_LOADING = 'SET_LOADING',
    SET_ERROR = 'SET_ERROR',
    CLEAR_ERROR = 'CLEAR_ERROR',
    UPDATE_USER = 'UPDATE_USER',
}

type AuthAction =
    | { type: AuthActionType.LOGIN_SUCCESS; payload: { user: User } }
    | { type: AuthActionType.REGISTER_SUCCESS; payload: { user: User } }
    | { type: AuthActionType.LOGOUT }
    | { type: AuthActionType.SET_LOADING; payload: boolean }
    | { type: AuthActionType.SET_ERROR; payload: string }
    | { type: AuthActionType.CLEAR_ERROR }
    | { type: AuthActionType.UPDATE_USER; payload: User };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case AuthActionType.LOGIN_SUCCESS:
        case AuthActionType.REGISTER_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AuthActionType.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                // isLoading: false, // Keep loading state as is or set to false? Legacy sets to false
                isLoading: false,
                error: null,
            };
        case AuthActionType.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
        case AuthActionType.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };
        case AuthActionType.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };
        case AuthActionType.UPDATE_USER:
            return {
                ...state,
                user: action.payload,
            };
        default:
            return state;
    }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state on app load
    useEffect(() => {
        const initAuth = async () => {
            try {
                dispatch({ type: AuthActionType.SET_LOADING, payload: true });

                if (authService.isAuthenticated()) {
                    const userData = authService.getStoredUser();

                    if (userData) {
                        // Optimistically set user from storage first
                        dispatch({
                            type: AuthActionType.LOGIN_SUCCESS,
                            payload: { user: userData },
                        });
                    }

                    // Verify token is still valid by fetching current user
                    try {
                        const response = await authService.getCurrentUser();
                        dispatch({
                            type: AuthActionType.LOGIN_SUCCESS,
                            payload: { user: response.data.user },
                        });
                    } catch (error) {
                        // Token invalid, clear stored data
                        authService.clearStoredData();
                        dispatch({ type: AuthActionType.LOGOUT });
                    }
                } else {
                    dispatch({ type: AuthActionType.SET_LOADING, payload: false });
                }
            } catch (error: any) {
                console.error('Auth initialization error:', error);
                dispatch({ type: AuthActionType.SET_ERROR, payload: error.message || 'Auth init failed' });
            }
        };

        initAuth();
    }, []);

    // Login action
    const login = async (credentials: any) => {
        try {
            dispatch({ type: AuthActionType.SET_LOADING, payload: true });
            dispatch({ type: AuthActionType.CLEAR_ERROR });

            const response = await authService.login(credentials);
            dispatch({
                type: AuthActionType.LOGIN_SUCCESS,
                payload: { user: response.data.data.user }, // Corrected path based on authService return
            });

            return response;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({ type: AuthActionType.SET_ERROR, payload: errorMessage });
            throw error;
        }
    };

    // Register action
    const register = async (userData: any) => {
        try {
            dispatch({ type: AuthActionType.SET_LOADING, payload: true });
            dispatch({ type: AuthActionType.CLEAR_ERROR });

            const response = await authService.register(userData);
            dispatch({
                type: AuthActionType.REGISTER_SUCCESS,
                payload: { user: response.data.data.user }, // Corrected path
            });

            return response;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            dispatch({ type: AuthActionType.SET_ERROR, payload: errorMessage });
            throw error;
        }
    };

    // Logout action
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch({ type: AuthActionType.LOGOUT });
        }
    };

    // Update user action
    const updateUser = (userData: User) => {
        dispatch({ type: AuthActionType.UPDATE_USER, payload: userData });
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Social login action
    const loginWithSocial = async (provider: string, token: string, userData: any = {}) => {
        try {
            dispatch({ type: AuthActionType.SET_LOADING, payload: true });
            dispatch({ type: AuthActionType.CLEAR_ERROR });

            const response = await authService.socialLogin(provider, token, userData);
            dispatch({
                type: AuthActionType.LOGIN_SUCCESS,
                payload: { user: response.data.data.user }, // Corrected path
            });

            return response;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || `${provider} login failed`;
            dispatch({ type: AuthActionType.SET_ERROR, payload: errorMessage });
            throw error;
        }
    };

    // Clear error action
    const clearError = () => {
        dispatch({ type: AuthActionType.CLEAR_ERROR });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateUser,
        clearError,
        loginWithSocial,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
