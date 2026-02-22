<template>
  <div class="coaches-page">
    <!-- Header -->
    <div class="page-header">
      <router-link to="/dashboard" class="back-link">
        <span class="material-icons-outlined">arrow_back</span>
        Back
      </router-link>
      <div class="header-content">
        <h1 class="page-title">Coaches</h1>
        <p class="page-subtitle">Choose your manager</p>
      </div>
      <div class="user-coins" v-if="coins !== null">
        <span class="material-icons-outlined">payments</span>
        {{ formatCoins(coins) }}
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar-wrap">
      <span class="material-icons-outlined search-icon">search</span>
      <input
        v-model="search"
        class="search-input"
        placeholder="Search by name, club or nationality…"
        type="text"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-wrap">
      <div class="spinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-box">{{ error }}</div>

    <!-- Grid -->
    <div v-else class="coaches-grid">
      <div
        v-for="coach in filtered"
        :key="coach.id"
        class="coach-card"
        :class="{ selected: myCoach?.id === coach.id }"
        @click="selectCoach(coach)"
      >
        <!-- Selected badge -->
        <div v-if="myCoach?.id === coach.id" class="selected-badge">
          <span class="material-icons-outlined">check_circle</span>
          Your Coach
        </div>

        <!-- Avatar -->
        <div class="coach-avatar">
          <img v-if="coach.image_url" :src="coach.image_url" :alt="coach.name" />
          <span v-else class="material-icons-outlined avatar-icon">person</span>
        </div>

        <!-- Info -->
        <div class="coach-info">
          <h3 class="coach-name">{{ coach.name }}</h3>
          <div class="coach-meta">
            <span class="coach-club">
              <span class="material-icons-outlined meta-icon">sports_soccer</span>
              {{ coach.club || 'Free Agent' }}
            </span>
            <span class="coach-nationality">
              <span class="material-icons-outlined meta-icon">flag</span>
              {{ coach.nationality || '—' }}
            </span>
          </div>

          <!-- Tactical Style & Formation -->
          <div class="bonus-info">
            <div class="bonus-tag style" :title="getStyleDescription(coach.style)">
              <span class="material-icons-outlined">psychology</span>
              {{ coach.style || 'Standard' }}
            </div>
            <div class="bonus-tag formation">
              <span class="material-icons-outlined">grid_view</span>
              {{ coach.preferred_formation || 'Any' }}
            </div>
          </div>

          <!-- Star Rating -->
          <div class="star-rating" :title="`${coach.rating} / 5`">
            <template v-for="i in 5" :key="i">
              <svg
                class="star"
                :class="getStarClass(coach.rating, i)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient :id="`half-${coach.id}-${i}`" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stop-color="currentColor" />
                    <stop offset="50%" stop-color="transparent" />
                  </linearGradient>
                </defs>
                <polygon
                  v-if="getStarClass(coach.rating, i) === 'half'"
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  :fill="`url(#half-${coach.id}-${i})`"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <polygon
                  v-else
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  :fill="getStarClass(coach.rating, i) === 'full' ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </template>
            <span class="rating-value">{{ coach.rating.toFixed(1) }}</span>
          </div>

          <!-- Description -->
          <p v-if="coach.description" class="coach-desc">{{ coach.description }}</p>
        </div>

        <!-- Buy / Select button -->
        <div class="card-footer">
          <button
            v-if="!isOwned(coach.id)"
            class="buy-btn"
            :disabled="coins < coach.price"
            @click.stop="buyCoach(coach)"
          >
            <span class="material-icons-outlined">shopping_cart</span>
            Buy for {{ formatCoins(coach.price) }}
          </button>
          <button
            v-else
            class="select-btn"
            :class="{ active: myCoach?.id === coach.id }"
            @click.stop="selectCoach(coach)"
          >
            <span class="material-icons-outlined">{{ myCoach?.id === coach.id ? 'check' : 'add' }}</span>
            {{ myCoach?.id === coach.id ? 'Selected' : 'Select' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !error && filtered.length === 0" class="empty-state">
      <span class="material-icons-outlined empty-icon">search_off</span>
      <p>No coaches match your search.</p>
    </div>

    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="toast" class="toast">
        <span class="material-icons-outlined">check_circle</span>
        {{ toast }}
      </div>
    </transition>
    <!-- Team Picker Modal -->
    <div v-if="teamModalCoach" class="modal-overlay" @click="teamModalCoach = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Assign {{ teamModalCoach.name }}</h3>
          <button class="close-btn" @click="teamModalCoach = null">
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Pick a team for this coach to train:</p>
          <div v-if="teamsLoading" class="modal-loading">
            <div class="spinner"></div>
            Loading teams...
          </div>
          <div v-else-if="userTeams.length === 0" class="no-teams">
            No teams found. Go to Squads to create one!
          </div>
          <div v-else class="teams-list">
            <div 
              v-for="team in userTeams" 
              :key="team.id" 
              class="team-item"
              :class="{ active: team.coach_id === teamModalCoach.id }"
              @click="assignToTeam(team)"
            >
              <div class="team-info">
                <span class="team-name">{{ team.name }}</span>
                <span class="team-formation">{{ team.formation }}</span>
              </div>
              <div class="assignment-status">
                <span v-if="team.coach_id === teamModalCoach.id" class="status-badge assigned">Training</span>
                <span v-else class="status-badge pick">Pick</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const coaches = ref([]);
const ownedIds = ref([]);
const userTeams = ref([]);
const teamModalCoach = ref(null);
const teamsLoading = ref(false);
const myCoach = ref(null);
const coins = ref(null);
const loading = ref(true);
const error = ref('');
const search = ref('');
const toast = ref('');

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return coaches.value;
  return coaches.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.club || '').toLowerCase().includes(q) ||
    (c.nationality || '').toLowerCase().includes(q)
  );
});

/**
 * Returns 'full', 'half', or 'empty' for star position i (1-based).
 */
function getStarClass(rating, i) {
  if (rating >= i) return 'full';
  if (rating >= i - 0.5) return 'half';
  return 'empty';
}

function isOwned(coachId) {
  return ownedIds.value.includes(coachId);
}

function formatCoins(num) {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function loadCoaches() {
  try {
    const [coachesRes, myCoachRes, ownedRes, coinsRes] = await Promise.all([
      fetch('/api/coaches'),
      authStore.token
        ? fetch('/api/my-coach', { headers: { Authorization: `Bearer ${authStore.token}` } })
        : Promise.resolve(null),
      authStore.token
        ? fetch('/api/owned-coaches', { headers: { Authorization: `Bearer ${authStore.token}` } })
        : Promise.resolve(null),
      authStore.token
        ? fetch('/api/coins', { headers: { Authorization: `Bearer ${authStore.token}` } })
        : Promise.resolve(null)
    ]);

    if (!coachesRes.ok) throw new Error('Failed to load coaches');
    coaches.value = await coachesRes.json();

    if (myCoachRes && myCoachRes.ok) {
      myCoach.value = await myCoachRes.json();
    }
    if (ownedRes && ownedRes.ok) {
        ownedIds.value = await ownedRes.json();
    }
    if (coinsRes && coinsRes.ok) {
        const data = await coinsRes.json();
        coins.value = data.coins;
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function buyCoach(coach) {
  if (!authStore.token) return;
  if (coins.value < coach.price) return;

  try {
    const res = await fetch('/api/coaches/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ coachId: coach.id })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to buy coach');

    ownedIds.value.push(coach.id);
    coins.value = data.newBalance;
    showToast(`You bought ${coach.name}!`);
    
    // Open team selection modal after purchase
    openTeamModal(coach);
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

async function openTeamModal(coach) {
  teamModalCoach.value = coach;
  teamsLoading.value = true;
  try {
    const res = await fetch('/api/my-teams', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    if (res.ok) {
      userTeams.value = await res.json();
    }
  } catch (e) {
    console.error('Failed to load teams', e);
  } finally {
    teamsLoading.value = false;
  }
}

async function assignToTeam(team) {
  if (!teamModalCoach.value) return;
  
  try {
    const res = await fetch('/api/coaches/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ 
        coachId: teamModalCoach.value.id,
        teamId: team.id
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign coach');

    // Update local state
    team.coach_id = teamModalCoach.value.id;
    showToast(`${teamModalCoach.value.name} is now training ${team.name}!`);
    teamModalCoach.value = null;
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}

async function selectCoach(coach) {
  if (!authStore.token) return;
  // Instead of direct assignment, open the team picker
  openTeamModal(coach);
}

function showToast(msg) {
  toast.value = msg;
  setTimeout(() => { toast.value = ''; }, 3000);
}

function getStyleDescription(style) {
  const descriptions = {
    'Gegenpressing': '+Tackle, +Shoot (High Intensity)',
    'Tiki-Taka': '+Pass, +Shoot (Possession)',
    'Catenaccio': '+Tackle, -Shoot (Defensive)',
    'Total Football': '+Pass, +Tackle (Balanced)',
    'Counter Attack': '+Shoot, +Power (Fast Breaks)'
  };
  return descriptions[style] || 'Standard tactical style';
}

onMounted(loadCoaches);
</script>

<style scoped>
/* ── Page Layout ─────────────────────────────────────────────────── */
.coaches-page {
  min-height: 100vh;
  background: #0a0f1a;
  padding: 24px 20px 60px;
  font-family: 'Inter', sans-serif;
}

/* ── Header ──────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00ff41;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  transition: opacity 0.2s;
}
.back-link:hover { opacity: 0.75; }
.back-link .material-icons-outlined { font-size: 18px; }
.header-content { flex: 1; }
.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
}
.page-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 2px 0 0;
}
.user-coins {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  color: #00ff41;
  font-weight: 700;
  font-size: 15px;
}
.user-coins .material-icons-outlined { color: #f59e0b; }

/* ── Search ──────────────────────────────────────────────────────── */
.search-bar-wrap {
  position: relative;
  max-width: 480px;
  margin-bottom: 32px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 20px;
  pointer-events: none;
}
.search-input {
  width: 100%;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 12px;
  padding: 12px 16px 12px 44px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.search-input::placeholder { color: #4b5563; }
.search-input:focus { border-color: #00ff41; }

/* ── Grid ────────────────────────────────────────────────────────── */
.coaches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* ── Coach Card ──────────────────────────────────────────────────── */
.coach-card {
  position: relative;
  background: linear-gradient(135deg, #111827 0%, #0d1520 100%);
  border: 1px solid #1f2937;
  border-radius: 20px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
}
.coach-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(0,255,65,0.04) 0%, transparent 70%);
  pointer-events: none;
}
.coach-card:hover {
  transform: translateY(-4px);
  border-color: #374151;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4);
}
.coach-card.selected {
  border-color: #00ff41;
  box-shadow: 0 0 30px rgba(0,255,65,0.15), 0 12px 40px rgba(0,0,0,0.4);
}

/* ── Selected Badge ──────────────────────────────────────────────── */
.selected-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0,255,65,0.15);
  color: #00ff41;
  border: 1px solid rgba(0,255,65,0.3);
  border-radius: 20px;
  padding: 3px 10px 3px 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.selected-badge .material-icons-outlined { font-size: 14px; }

/* ── Avatar ──────────────────────────────────────────────────────── */
.coach-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f2937, #111827);
  border: 2px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-icon {
  font-size: 40px;
  color: #4b5563;
}

/* ── Info ────────────────────────────────────────────────────────── */
.coach-info {
  text-align: center;
  width: 100%;
}
.coach-name {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}
.coach-meta {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.coach-club, .coach-nationality {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #6b7280;
}
.meta-icon { font-size: 13px; }

/* ── Bonus Info ─────────────────────────────────────────────────── */
.bonus-info {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 14px;
}
.bonus-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.bonus-tag .material-icons-outlined { font-size: 14px; }
.bonus-tag.style {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.bonus-tag.formation {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* ── Star Rating ─────────────────────────────────────────────────── */
.star-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin-bottom: 12px;
}
.star {
  width: 18px;
  height: 18px;
  transition: transform 0.15s;
}
.star.full  { color: #f59e0b; }
.star.half  { color: #f59e0b; }
.star.empty { color: #374151; }
.coach-card:hover .star { transform: scale(1.1); }
.rating-value {
  font-size: 12px;
  font-weight: 700;
  color: #f59e0b;
  margin-left: 4px;
}

/* ── Description ─────────────────────────────────────────────────── */
.coach-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Buy / Select Button ─────────────────────────────────────────── */
.card-footer {
  width: 100%;
  margin-top: auto;
}
.buy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: #00ff41;
  color: #0a0f1a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}
.buy-btn:hover:not(:disabled) {
  background: #00cc33;
  transform: translateY(-1px);
}
.buy-btn:disabled {
  background: #1f2937;
  color: #4b5563;
  cursor: not-allowed;
  opacity: 0.6;
}
.buy-btn .material-icons-outlined { font-size: 16px; }

.select-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  border: 1px solid #374151;
  background: transparent;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}
.select-btn .material-icons-outlined { font-size: 16px; }
.select-btn:hover {
  border-color: #00ff41;
  color: #00ff41;
  background: rgba(0,255,65,0.05);
}
.select-btn.active {
  border-color: #00ff41;
  color: #00ff41;
  background: rgba(0,255,65,0.1);
}

/* ── Modal ───────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #f3f4f6;
}

.close-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 16px;
}

.teams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.team-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.team-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.team-item.active {
  border-color: #00ff41;
  background: rgba(0, 255, 65, 0.05);
}

.team-name {
  display: block;
  font-weight: 600;
  color: #f3f4f6;
}

.team-formation {
  font-size: 12px;
  color: #6b7280;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.assigned {
  background: rgba(0, 255, 65, 0.1);
  color: #00ff41;
}

.status-badge.pick {
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
}

.modal-loading {
  text-align: center;
  color: #9ca3af;
  padding: 20px;
}

/* ── Loading / Error / Empty ─────────────────────────────────────── */
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #1f2937;
  border-top-color: #00ff41;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-box {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px;
  padding: 20px;
  color: #f87171;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #4b5563;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; display: block; }

/* ── Toast ───────────────────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #00ff41;
  color: #0a0f1a;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0,255,65,0.4);
  z-index: 9999;
}
.toast .material-icons-outlined { font-size: 18px; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>
