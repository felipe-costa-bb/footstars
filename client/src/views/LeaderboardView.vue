<template>
  <div class="min-h-screen bg-field-dark p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <router-link to="/dashboard" class="text-field-accent hover:text-field-accent/80 mb-2 inline-block">
          ← Back to Dashboard
        </router-link>
        <h1 class="text-4xl font-bold text-white">Leaderboard</h1>
        <p class="text-gray-400">Top managers by wins</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-field-accent"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-900/30 border border-red-600 rounded-lg p-6 text-center text-red-400">
        {{ error }}
      </div>

      <!-- Leaderboard Table -->
      <div v-else class="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-900">
            <tr>
              <th class="px-4 py-3 text-left text-gray-400 font-semibold">#</th>
              <th class="px-4 py-3 text-left text-gray-400 font-semibold">Manager</th>
              <th class="px-4 py-3 text-center text-gray-400 font-semibold">Wins</th>
              <th class="px-4 py-3 text-center text-gray-400 font-semibold">Losses</th>
              <th class="px-4 py-3 text-center text-gray-400 font-semibold">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, index) in players"
              :key="player.id"
              class="border-t border-gray-700 hover:bg-gray-700/50 transition"
              :class="{ 'bg-field-accent/10': isCurrentUser(player) }"
            >
              <td class="px-4 py-3">
                <span 
                  class="font-bold"
                  :class="{
                    'text-yellow-400': index === 0,
                    'text-gray-300': index === 1,
                    'text-amber-600': index === 2,
                    'text-gray-500': index > 2
                  }"
                >
                  {{ index + 1 }}
                </span>
              </td>
              <td class="px-4 py-3 text-white font-semibold">
                {{ player.username }}
                <span v-if="isCurrentUser(player)" class="text-field-accent text-xs ml-2">(You)</span>
              </td>
              <td class="px-4 py-3 text-center text-green-400 font-bold">{{ player.wins }}</td>
              <td class="px-4 py-3 text-center text-red-400 font-bold">{{ player.losses }}</td>
              <td class="px-4 py-3 text-center text-white">{{ getWinRate(player) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const players = ref([]);
const loading = ref(true);
const error = ref('');

const isCurrentUser = (player) => player.id === authStore.user?.id;

const getWinRate = (player) => {
  const total = player.wins + player.losses;
  if (total === 0) return 0;
  return Math.round((player.wins / total) * 100);
};

onMounted(async () => {
  try {
    const res = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Failed to load leaderboard');
    players.value = await res.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
