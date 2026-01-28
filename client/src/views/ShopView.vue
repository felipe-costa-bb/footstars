<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/dashboard" class="text-field-accent hover:text-field-accent/80 mb-2 inline-block">
          ← Back to Dashboard
        </router-link>
        <h1 class="text-4xl font-bold text-white">Pack Shop</h1>
        <p class="text-gray-400">Spend your coins to get new players</p>
      </div>

      <!-- Coin Balance -->
      <div class="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-4 mb-8 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-4xl">🪙</span>
          <div>
            <div class="text-black/60 text-sm font-semibold">Your Balance</div>
            <div class="text-3xl font-bold text-black">{{ coins.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-field-accent"></div>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-900/30 border border-red-600 rounded-lg p-4 text-center text-red-400 mb-6">
        {{ error }}
      </div>

      <!-- Pack Options -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Bronze Pack -->
        <div class="bg-gradient-to-b from-amber-700 to-amber-900 rounded-xl p-6 border-2 border-amber-600 hover:border-amber-400 transition transform hover:scale-105 cursor-pointer" @click="buyPack('bronze')">
          <div class="text-center">
            <div class="text-6xl mb-4">📦</div>
            <h3 class="text-2xl font-bold text-white mb-2">Bronze Pack</h3>
            <p class="text-amber-200 mb-4">3 Random Players</p>
            <div class="bg-black/30 rounded-lg py-3 px-4">
              <span class="text-yellow-400 font-bold text-xl">500 🪙</span>
            </div>
          </div>
        </div>

        <!-- Silver Pack -->
        <div class="bg-gradient-to-b from-gray-400 to-gray-600 rounded-xl p-6 border-2 border-gray-300 hover:border-white transition transform hover:scale-105 cursor-pointer" @click="buyPack('silver')">
          <div class="text-center">
            <div class="text-6xl mb-4">🎁</div>
            <h3 class="text-2xl font-bold text-white mb-2">Silver Pack</h3>
            <p class="text-gray-200 mb-4">5 Random Players</p>
            <div class="bg-black/30 rounded-lg py-3 px-4">
              <span class="text-yellow-400 font-bold text-xl">1,000 🪙</span>
            </div>
          </div>
        </div>

        <!-- Gold Pack -->
        <div class="bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-xl p-6 border-2 border-yellow-400 hover:border-yellow-200 transition transform hover:scale-105 cursor-pointer" @click="buyPack('gold')">
          <div class="text-center">
            <div class="text-6xl mb-4">🏆</div>
            <h3 class="text-2xl font-bold text-black mb-2">Gold Pack</h3>
            <p class="text-yellow-900 mb-4">7 Random Players</p>
            <div class="bg-black/30 rounded-lg py-3 px-4">
              <span class="text-yellow-300 font-bold text-xl">2,500 🪙</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pack Opening Result -->
      <div v-if="packResult" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50" @click="packResult = null">
        <div class="bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4 border border-gray-600" @click.stop>
          <h2 class="text-2xl font-bold text-white text-center mb-6">🎉 Pack Opened!</h2>
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div v-for="card in packResult.cards" :key="card.id" class="bg-gray-700 rounded-lg p-3 text-center">
              <div class="w-12 h-12 rounded-full bg-gray-600 mx-auto mb-2 overflow-hidden">
                <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${card.player?.id || card.player_id}`" class="w-full h-full" />
              </div>
              <div class="text-white text-sm font-semibold truncate">{{ card.player?.name || card.player_id }}</div>
            </div>
          </div>
          <button @click="packResult = null" class="w-full bg-field-accent hover:bg-field-accent/90 text-white font-bold py-3 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const coins = ref(0);
const loading = ref(true);
const error = ref('');
const packResult = ref(null);

const fetchCoins = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/coins', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      const data = await res.json();
      coins.value = data.coins;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const buyPack = async (packType) => {
  error.value = '';
  
  try {
    const res = await fetch('http://localhost:3000/api/buy-pack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ packType })
    });

    const data = await res.json();
    
    if (res.ok && data.success) {
      packResult.value = data;
      coins.value = data.newBalance;
    } else {
      error.value = data.error || 'Failed to buy pack';
    }
  } catch (err) {
    error.value = err.message;
  }
};

onMounted(() => {
  fetchCoins();
});
</script>
