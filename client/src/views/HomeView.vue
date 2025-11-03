<template>
  <div class="min-h-screen bg-field-dark flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-field-accent mb-2">⚽ Field Battle</h1>
        <p class="text-gray-400 text-lg">Real-time multiplayer soccer simulation</p>
      </div>

      <!-- Main Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Create Game -->
        <router-link to="/create">
          <div class="bg-gray-800 border-2 border-field-accent rounded-lg p-8 hover:bg-gray-700 transition cursor-pointer h-full">
            <div class="text-4xl mb-4">🎮</div>
            <h2 class="text-2xl font-bold mb-2">Create Game</h2>
            <p class="text-gray-400 mb-4">Start a new game and choose your team</p>
            <div class="text-field-accent font-semibold">Get session ID →</div>
          </div>
        </router-link>

        <!-- Join Game -->
        <router-link to="/join">
          <div class="bg-gray-800 border-2 border-field-accent rounded-lg p-8 hover:bg-gray-700 transition cursor-pointer h-full">
            <div class="text-4xl mb-4">🔗</div>
            <h2 class="text-2xl font-bold mb-2">Join Game</h2>
            <p class="text-gray-400 mb-4">Enter a session ID and join a friend</p>
            <div class="text-field-accent font-semibold">Join session →</div>
          </div>
        </router-link>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center text-gray-500 text-sm">
        <p>Made with Vue 3 + Tailwind | WebSocket multiplayer</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Home view - entry point
</script>
