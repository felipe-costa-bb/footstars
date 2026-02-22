<template>
  <aside class="w-28 min-h-screen flex flex-col items-center py-6 z-50 bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-r border-white/5 shadow-[5px_0_40px_rgba(0,0,0,0.6)]">
    <!-- Brand -->
    <div class="mb-8 relative group cursor-pointer flex-shrink-0">
      <div class="absolute inset-0 bg-field-accent blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
      <div class="text-4xl font-display italic font-bold text-transparent bg-clip-text bg-gradient-to-br from-field-accent to-white relative z-10">
        FS
      </div>
    </div>

    <!-- Nav Items -->
    <nav class="grow shrink-0 space-y-4 w-full flex flex-col items-center">
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

      <router-link to="/coaches" class="w-full flex justify-center outline-none">
        <NavItem icon="person" label="COACHES" :active="$route.path === '/coaches'" />
      </router-link>
    </nav>
    
    <!-- User Footer -->
    <div class="mt-auto flex flex-col items-center gap-4 pb-6 w-full px-4">
      
      <!-- Mini Profile -->
      <div class="flex flex-col items-center group cursor-pointer">
        <div class="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-field-accent to-pitch-green shadow-lg shadow-field-accent/20 mb-2 transition-transform duration-300 group-hover:scale-105">
           <div class="bg-gray-900 w-full h-full rounded-full overflow-hidden">
              <img :src="userAvatar" alt="User" class="w-full h-full object-cover" />
           </div>
        </div>
        <span class="text-[10px] font-display font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest max-w-[80px] truncate">
          {{ username }}
        </span>
      </div>

      <!-- Audio Toggle -->
      <button @click="toggleMute" class="text-gray-500 hover:text-pitch-green hover:bg-pitch-green/10 p-2 rounded-lg transition-all mb-2 relative group/audio" :title="audioStore.isMuted ? 'Unmute' : 'Mute'">
        <span class="material-icons-outlined text-xl">{{ audioStore.isMuted ? 'volume_off' : 'volume_up' }}</span>
      </button>

      <!-- Divider -->
      <div class="w-10 h-[1px] bg-white/10"></div>

      <!-- Logout -->
      <button @click="logout" class="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all group/logout relative" title="Logout">
        <span class="material-icons-outlined text-xl group-hover/logout:-translate-x-0.5 transition-transform">logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import NavItem from './NavItem.vue';
import { useAuthStore } from '../stores/auth';
import { useAudioStore } from '../stores/audio';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const authStore = useAuthStore();
const audioStore = useAudioStore();
const router = useRouter();

const toggleMute = () => {
    // If sound hasn't been enabled yet (first interaction), this will enable it
    if (!audioStore.soundEnabled) {
        audioStore.enableSound();
    }
    audioStore.toggleMute();
};


const username = computed(() => authStore.user?.username || 'Coach');
const userAvatar = computed(() => {
    if (authStore.user?.avatar_url) return authStore.user.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.value}`;
});

const logout = () => {
    authStore.logout();
    router.push('/');
};
</script>
