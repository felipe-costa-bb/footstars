import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
    const error = ref(null);
    const loading = ref(false);

    const isAuthenticated = computed(() => !!token.value);

    const setUser = (userData, authToken) => {
        user.value = userData;
        token.value = authToken;

        if (authToken) {
            localStorage.setItem('token', authToken);
        }
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const login = async (username, password) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setUser(data.user, data.token);
            return true;
        } catch (err) {
            console.error("Login Error:", err);
            error.value = err.message;
            return false;
        } finally {
            loading.value = false;
        }
    };

    const register = async (username, password) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setUser(data.user, data.token);
            return true;
        } catch (err) {
            console.error("Register Error:", err);
            error.value = err.message;
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateProfile = async ({ username, avatarUrl }) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`
                },
                body: JSON.stringify({ username, avatarUrl })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Update failed');
            }

            // Update local user state
            user.value = { ...user.value, ...data };
            localStorage.setItem('user', JSON.stringify(user.value));

            return true;
        } catch (err) {
            console.error("Update Profile Error:", err);
            error.value = err.message;
            return false;
        } finally {
            loading.value = false;
        }
    };

    const logout = () => {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return {
        token,
        user,
        error,
        loading,
        isAuthenticated,
        login,
        register,
        updateProfile,
        logout
    };
});
