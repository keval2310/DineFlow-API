import api from '../utils/axios';

export interface LoginRequest {
    UserName: string;
    Password: string;
}

export interface LoginResponse {
    error: boolean;
    message: string;
    data: {
        token: string;
    };
}

export interface SignupRequest {
    UserName: string;
    Password: string;
    UserRole: string;
    RestaurantID: number;
}

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post('/users/login', credentials);
        return response.data;
    },

    signup: async (userData: SignupRequest) => {
        const response = await api.post('/users/signup', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
