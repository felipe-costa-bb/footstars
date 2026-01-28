<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/dashboard" class="text-field-accent hover:text-field-accent/80 mb-2 inline-block">
          ← Back to Dashboard
        </router-link>
        <h1 class="text-4xl font-bold text-white">Match History</h1>
        <p class="text-gray-400">Your recent matches and results</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-field-accent"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-900/30 border border-red-600 rounded-lg p-6 text-center text-red-400">
        {{ error }}
      </div>

      <!-- Empty -->
      <div v-else-if="matches.length === 0" class="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
        <div class="text-6xl mb-4">⚽</div>
        <h3 class="text-xl font-bold text-white mb-2">No Matches Yet</h3>
        <p class="text-gray-400">Play your first match to see it here!</p>
      </div>

      <!-- Match List -->
      <div v-else class="space-y-4">
        <div
          v-for="match in matches"
          :key="match.id"
          class="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
          :class="isWin(match) ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'"
        >
          <div class="flex items-center space-x-4">
            <div class="text-2xl font-bold" :class="isWin(match) ? 'text-green-400' : 'text-red-400'">
              {{ isWin(match) ? 'W' : 'L' }}
            </div>
            <div>
              <div class="text-white font-semibold">
                vs {{ getOpponentName(match) }}
              </div>
              <div class="text-gray-400 text-sm">
                {{ formatDate(match.played_at) }}
              </div>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-2xl font-bold text-white">
              {{ match.score_winner }} - {{ match.score_loser }}
            </div>
            <div v-if="match.ante_card_id" class="text-xs text-yellow-400">
              {{ isWin(match) ? '+1 Card Won' : '-1 Card Lost' }}
            </div>
          </div>
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

const matches = ref([]);
const loading = ref(true);
const error = ref('');

const isWin = (match) => match.winner_id === authStore.user?.id;

const getOpponentName = (match) => {
  return isWin(match) ? match.loser_name : match.winner_name;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
    return;
  }

  try {
    const res = await fetch('/api/match-history', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    if (!res.ok) throw new Error('Failed to load history');
    matches.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
