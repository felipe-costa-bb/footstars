<template>
  <aside class="w-28 h-screen bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-10 z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
    <!-- Brand -->
    <div class="mb-14 relative group cursor-pointer">
      <div class="absolute inset-0 bg-field-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div class="text-4xl font-display italic font-bold text-transparent bg-clip-text bg-gradient-to-br from-field-accent to-white relative z-10">
        FS
      </div>
    </div>

    <!-- Nav Items -->
    <nav class="flex-1 space-y-8 w-full flex flex-col items-center">
      <router-link to="/dashboard" class="w-full flex justify-center outline-none">
        <NavItem icon="home" label="HOME" :active="$route.path === '/dashboard'" />
      </router-link>
      
      <router-link to="/collection" class="w-full flex justify-center outline-none">
        <NavItem icon="style" label="CLUB" :active="$route.path === '/collection'" />
      </router-link>

      <router-link to="/my-teams" class="w-full flex justify-center outline-none">
        <NavItem icon="sports_soccer" label="TEAMS" :active="$route.path === '/my-teams'" />
      </router-link>

      <router-link to="/team-builder" class="w-full flex justify-center outline-none">
        <NavItem icon="groups" label="SQUAD" :active="$route.path === '/team-builder'" />
      </router-link>

      <router-link to="/shop" class="w-full flex justify-center outline-none">
        <NavItem icon="shopping_cart" label="SHOP" :active="$route.path === '/shop'" />
      </router-link>
    </nav>
    
    <!-- Logout -->
    <button @click="logout" class="text-gray-500 hover:text-red-500 transition-colors mt-auto pb-4 group relative">
      <div class="absolute inset-0 bg-red-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
      <span class="material-icons-outlined relative z-10">logout</span>
    </button>
  </aside>
</template>

<script setup>
import NavItem from './NavItem.vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
    authStore.logout();
    router.push('/');
};
</script>
