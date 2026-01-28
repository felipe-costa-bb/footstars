<template>
  <div class="min-h-screen bg-pitch-dark bg-stadium bg-cover bg-center flex items-center justify-center relative overflow-hidden">
    <!-- Overlay for atmosphere -->
    <div class="absolute inset-0 bg-pitch-dark/60 z-0"></div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-md p-6">
      
      <!-- Logo Area -->
      <div class="text-center mb-8">
        <h1 class="font-display text-5xl font-bold italic text-white tracking-wider drop-shadow-[0_0_15px_rgba(0,255,65,0.6)]">
          FIELD <span class="text-pitch-green">BATTLE</span>
        </h1>
        <p class="text-gray-300 text-sm tracking-[0.2em] font-sports mt-1">PRO EDITION</p>
      </div>

      <!-- Glass Card -->
      <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h2 class="font-display text-2xl text-white mb-6 text-center">
          {{ isRegisterMode ? 'CREATE ACCOUNT' : 'ENTER THE PITCH' }}
        </h2>

        <!-- Error Display -->
        <div v-if="errorMessage" class="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-300 text-sm text-center">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          
          <!-- Username Input -->
          <div class="group">
            <label class="block text-xs font-sports text-gray-400 mb-1 ml-1 group-focus-within:text-pitch-green transition-colors">USERNAME</label>
            <input 
              v-model="username"
              type="text" 
              class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pitch-green focus:ring-1 focus:ring-pitch-green transition-all font-sports"
              placeholder="StrikerPro99"
              required
            />
          </div>

          <!-- Password Input -->
          <div class="group">
            <label class="block text-xs font-sports text-gray-400 mb-1 ml-1 group-focus-within:text-pitch-green transition-colors">PASSWORD</label>
            <input 
              v-model="password"
              type="password" 
              class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pitch-green focus:ring-1 focus:ring-pitch-green transition-all font-sports"
              placeholder="••••••••"
              required
            />
          </div>

          <!-- Action Button -->
          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-gradient-to-r from-pitch-green to-green-600 text-black font-display font-bold text-lg py-3 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all transform shadow-[0_0_20px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">{{ isRegisterMode ? 'SIGN UP' : 'KICK OFF' }}</span>
            <span v-else class="animate-pulse">{{ isRegisterMode ? 'CREATING...' : 'CONNECTING...' }}</span>
          </button>

          <!-- Toggle Links -->
          <div class="text-center text-sm font-sports text-gray-400 mt-4">
            <button 
              type="button"
              @click="toggleMode" 
              class="hover:text-pitch-green transition-colors underline"
            >
              {{ isRegisterMode ? 'Already have an account? Login' : 'Create Account' }}
            </button>
          </div>

        </form>
      </div>
      
      <!-- Footer -->
      <div class="mt-8 text-center text-gray-500 text-xs font-sports">
        &copy; 2026 FIELD BATTLE LEAGUE
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const isRegisterMode = ref(false);
const errorMessage = ref('');

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  let success;
  if (isRegisterMode.value) {
    success = await authStore.register(username.value, password.value);
  } else {
    success = await authStore.login(username.value, password.value);
  }
  
  loading.value = false;
  
  if (success) {
    router.push('/dashboard');
  } else {
    errorMessage.value = authStore.error || 'An error occurred';
  }
};
</script>
