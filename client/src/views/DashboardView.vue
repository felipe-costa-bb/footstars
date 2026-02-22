<template>
  <div class="flex min-h-screen bg-gray-900 text-white font-sports">
    <Sidebar />

    <main class="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-gray-800">
      <!-- Background Texture -->
      <div class="absolute inset-0 bg-[url('/assets/carbon-fibre.png')] opacity-10 z-0 pointer-events-none"></div>

      <!-- Header -->
      <header class="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md z-20">
         <h2 class="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">MY CLUB</h2>
         
         <div class="flex items-center gap-6">
            <!-- Balance -->
            <div class="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm group hover:border-field-accent/50 transition-colors">
                <Coins class="w-5 h-5 text-yellow-400 drop-shadow-md" />
                <span class="font-bold font-display text-xl tracking-wider">{{ formattedCoins }}</span>
            </div>

            <!-- Profile -->
            <div class="flex items-center gap-4 pl-6 border-l border-white/10">
                <div class="text-right hidden md:block">
                    <div class="font-bold font-display text-lg leading-none tracking-wide">{{ username }}</div>
                    <div class="text-xs text-brand-blue font-bold tracking-widest mt-1">MANAGER</div>
                </div>
                <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-blue to-purple-600 p-[2px] shadow-lg">
                    <div class="w-full h-full rounded-full bg-gray-900 overflow-hidden relative">
                        <img :src="userAvatar" alt="User" class="w-full h-full object-cover" />
                    </div>
                </div>
                <button @click="openEditProfile" class="ml-2 text-gray-400 hover:text-white transition-colors">
                    <Edit class="w-4 h-4" />
                </button>
            </div>
         </div>
      </header>
      
      <!-- Edit Profile Modal -->
      <div v-if="isEditProfileOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md relative">
            <button @click="isEditProfileOpen = false" class="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X class="w-5 h-5" />
            </button>
            <h2 class="text-2xl font-bold font-display text-white mb-6">Edit Profile</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Username</label>
                    <input v-model="editUsername" type="text" class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-field-accent outline-none" placeholder="Enter username" />
                </div>
                
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Avatar</label>
                    <div class="flex gap-2 mb-2" v-if="!designMode">
                        <input v-model="editAvatarUrl" type="text" class="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-field-accent outline-none" placeholder="https://..." />
                        <button @click="randomizeAvatar" class="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white" title="Randomize">
                            <Dices class="w-5 h-5" />
                        </button>
                    </div>

                    <div class="flex flex-col gap-3 py-2" v-else>
                         <!-- Designers -->
                         <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-xs text-gray-500 mb-1 block">Hair / Headwear</label>
                                <select v-model="selectedTop" class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-field-accent">
                                    <option v-for="opt in topStyles" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 mb-1 block">Clothing</label>
                                <select v-model="selectedClothing" class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-field-accent">
                                    <option v-for="opt in clothingStyles" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 mb-1 block">Accessories</label>
                                <select v-model="selectedAccessory" class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-field-accent">
                                    <option v-for="opt in accessoriesInterceptor" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 mb-1 block">Emotion</label>
                                <select v-model="selectedMouth" class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-field-accent">
                                    <option v-for="opt in mouthStyles" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 mb-1 block">Eyes</label>
                                <select v-model="selectedEyes" class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-field-accent">
                                    <option v-for="opt in eyesStyles" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                         </div>
                         
                            <div>
                                <label class="text-xs text-gray-500 mb-1 block">Eyebrows</label>
                                <select v-model="selectedEyebrows" class="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-field-accent">
                                    <option v-for="opt in eyebrowStyles" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>
                         
                         <!-- Colors -->
                         <div class="space-y-2 mt-2">
                             <div>
                                <label class="text-xs text-gray-500 mb-1 block">Skin Tone</label>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button v-for="color in skinColors" :key="color" @click="selectedSkin = color"
                                        class="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                                        :class="{'ring-2 ring-white': selectedSkin === color}"
                                        :style="{ backgroundColor: '#' + color }">
                                    </button>
                                </div>
                             </div>
                             <div>
                                <label class="text-xs text-gray-500 mb-1 block">Hair Color</label>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button v-for="color in hairColors" :key="color" @click="selectedTopColor = color"
                                        class="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                                        :class="{'ring-2 ring-white': selectedTopColor === color}"
                                        :style="{ backgroundColor: '#' + color }">
                                    </button>
                                </div>
                             </div>
                             <div>
                                <label class="text-xs text-gray-500 mb-1 block">Clothing Color</label>
                                <div class="flex gap-1.5 flex-wrap">
                                    <button v-for="color in clothesColors" :key="color" @click="selectedClothingColor = color"
                                        class="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                                        :class="{'ring-2 ring-white': selectedClothingColor === color}"
                                        :style="{ backgroundColor: '#' + color }">
                                    </button>
                                </div>
                             </div>
                         </div>
                    </div>
                    
                    <div class="flex items-center gap-4 mt-2 border-t border-white/5 pt-3">
                         <button @click="toggleDesignMode" class="text-xs text-brand-blue hover:text-white uppercase font-bold tracking-wider">
                             {{ designMode ? 'Switch to Upload/URL' : 'Switch to Designer' }}
                         </button>

                         <div class="flex-1" v-if="!designMode">
                             <button @click="triggerFileUpload" class="text-sm bg-gray-800 border border-white/10 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto">
                                <span class="material-icons-outlined text-sm">upload</span>
                                Upload
                             </button>
                             <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                         </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-4 mt-2">
                     <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-900 border-2 border-white/10">
                         <img :src="previewAvatar" class="w-full h-full object-cover" />
                     </div>
                     <div class="text-sm text-gray-400">Preview</div>
                </div>

                <div v-if="editError" class="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                    {{ editError }}
                </div>
                
                <button @click="saveProfile" :disabled="isSaving" class="w-full bg-field-accent text-black font-bold py-3 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="isSaving">Saving...</span>
                    <span v-else>Save Changes</span>
                </button>
            </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 p-6 lg:p-10 z-10 relative">
        
        <!-- Loading State -->
        <div v-if="loading" class="w-full h-96 flex justify-center items-center">
             <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-field-accent"></div>
        </div>

        <!-- No Team State -->
        <div v-else-if="!team" class="w-full h-full flex flex-col justify-center items-center text-center space-y-6 animate-fade-in">
             <h3 class="text-3xl font-display font-bold mb-2">Build Your Dream Team</h3>
             <p class="text-gray-400 max-w-md">You haven't set up your squad yet. Head to the Team Builder to select your starting XI.</p>
             <router-link to="/team-builder" class="px-8 py-4 bg-field-accent text-black font-display font-bold text-xl rounded-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_#00ff4140]">
                CREATE SQUAD
             </router-link>
        </div>

        <!-- Pitch and Subs Container -->
        <div v-else class="w-full max-w-7xl mx-auto flex gap-6">
          <!-- Pitch View (Vertical) -->
          <div class="flex-1 max-w-3xl aspect-[3/4] bg-pitch-green rounded-[2.5rem] border-[6px] border-white/10 relative shadow-2xl overflow-hidden flex flex-col justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/grass.png')] group">
             <!-- Pitch Lines Overlay -->
             <!-- Pitch Lines Overlay (Vertical) -->
             <div class="absolute inset-5 border-2 border-white/50 rounded-3xl opacity-80"></div>
             <!-- Center Line -->
             <div class="absolute left-5 right-5 top-1/2 h-0.5 bg-white/50 opacity-80"></div>
             <!-- Center Circle -->
             <div class="absolute h-32 w-32 border-2 border-white/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
             
             <!-- Goal Areas -->
             <div class="absolute top-5 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/50 rounded-b-xl opacity-60"></div>
             <div class="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/50 rounded-t-xl opacity-60"></div>


             <!-- Dynamic Formation Grid -->
             <!-- Players (Rectangular Cards) -->
             <div class="absolute inset-0 z-20">
                
                <!-- Forwards -->
                <div 
                    v-for="(p, i) in forwards" :key="p.id"
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 h-44 transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer"
                    :style="{ left: `${getFormationX(i, forwards.length)}%`, top: hasFiveRows ? '10%' : '15%' }"
                    @click="openDetail(p)"
                >
                    <PlayerCard 
                        :name="p.name || p.real_name" 
                        :rating="p.overallRating" 
                        :position="p.position" 
                        :imageUrl="p.imageUrl"
                        :team="p.team"
                        :nationality="p.nationality"
                        :league="p.league"
                        :stats="{power: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                        :rarity="getCardRarity(p.overallRating)"
                        noHover
                    />
                </div>

                <!-- Attacking Midfielders (only for 5-row formations like 4-2-3-1) -->
                <div 
                    v-for="(p, i) in attackingMidfielders" :key="'am-'+p.id"
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 h-44 transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer"
                    :style="{ left: `${getFormationX(i, attackingMidfielders.length)}%`, top: '28%' }"
                    @click="openDetail(p)"
                >
                    <PlayerCard 
                        :name="p.name || p.real_name" 
                        :rating="p.overallRating" 
                        :position="p.position" 
                        :imageUrl="p.imageUrl"
                        :team="p.team"
                        :nationality="p.nationality"
                        :league="p.league"
                        :stats="{power: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                        :rarity="getCardRarity(p.overallRating)"
                        noHover
                    />
                </div>

                <!-- Midfielders (or Defensive Midfielders for 5-row formations) -->
                <div 
                    v-for="(p, i) in midfielders" :key="p.id"
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 h-44 transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer"
                    :style="{ left: `${getFormationX(i, midfielders.length)}%`, top: hasFiveRows ? '44%' : '40%' }"
                    @click="openDetail(p)"
                >
                    <PlayerCard 
                        :name="p.name || p.real_name" 
                        :rating="p.overallRating" 
                        :position="p.position" 
                        :imageUrl="p.imageUrl"
                        :team="p.team"
                        :nationality="p.nationality"
                        :league="p.league"
                        :stats="{power: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                        :rarity="getCardRarity(p.overallRating)"
                        noHover
                    />
                </div>

                <!-- Defenders -->
                <div 
                    v-for="(p, i) in defenders" :key="p.id"
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 h-44 transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer"
                    :style="{ left: `${getFormationX(i, defenders.length)}%`, top: hasFiveRows ? '62%' : '65%' }"
                    @click="openDetail(p)"
                >
                    <PlayerCard 
                        :name="p.name || p.real_name" 
                        :rating="p.overallRating" 
                        :position="p.position" 
                        :imageUrl="p.imageUrl"
                        :team="p.team"
                        :nationality="p.nationality"
                        :league="p.league"
                        :stats="{power: p.power, shoot: p.shoot, pass: p.pass, tackle: p.tackle}" 
                        :rarity="getCardRarity(p.overallRating)"
                        noHover
                    />
                </div>

                <!-- Goalkeeper -->
                <div 
                    v-if="goalkeeper"
                    class="absolute transform -translate-x-1/2 -translate-y-1/2 w-32 h-44 transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer"
                    :style="{ left: '50%', top: hasFiveRows ? '82%' : '88%' }"
                    @click="openDetail(goalkeeper)"
                >
                     <PlayerCard 
                        :name="goalkeeper.name || goalkeeper.real_name" 
                        :rating="goalkeeper.overallRating" 
                        :position="goalkeeper.position" 
                        :imageUrl="goalkeeper.imageUrl"
                        :team="goalkeeper.team"
                        :nationality="goalkeeper.nationality"
                        :league="goalkeeper.league"
                        :stats="{power: goalkeeper.power, shoot: goalkeeper.shoot, pass: goalkeeper.pass, tackle: goalkeeper.tackle}" 
                        :rarity="getCardRarity(goalkeeper.overallRating)"
                        noHover
                     />
                </div>
             </div>
             
             <!-- Vignette -->
             <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none rounded-[2.5rem]"></div>
          </div>

          <!-- Substitutes Panel -->
          <div class="w-64 flex flex-col bg-gray-800/50 backdrop-blur-md rounded-[2.5rem] border-[6px] border-white/10 shadow-2xl overflow-hidden h-auto">
            <div class="px-4 py-3 border-b border-white/10 bg-black/20 shrink-0">
              <h3 class="text-sm font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">SUBSTITUTES</h3>
              <p class="text-xs text-gray-400 mt-0.5">{{ substitutes.length }} / 9 Players</p>
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-4 flex flex-col items-center">
              <div v-if="substitutes.length === 0" class="text-center py-8 text-gray-500">
                <p class="text-sm">No substitutes</p>
              </div>
              <div 
                v-for="(sub, i) in substitutes" 
                :key="'sub-'+i"
                class="w-32 h-44 transition-all duration-300 hover:scale-105 cursor-pointer"
                @click="openDetail(sub)"
              >
                <PlayerCard 
                  :name="sub.name || sub.real_name" 
                  :rating="sub.overallRating" 
                  :position="sub.position" 
                  :imageUrl="sub.imageUrl"
                  :team="sub.team"
                  :nationality="sub.nationality"
                  :league="sub.league"
                  :stats="{power: sub.power, shoot: sub.shoot, pass: sub.pass, tackle: sub.tackle}" 
                  :rarity="getCardRarity(sub.overallRating)"
                  noHover
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-10 flex justify-center gap-6 flex-wrap">
            <button @click="startGame" class="group relative px-10 py-4 bg-field-accent text-black font-display font-bold text-xl rounded-xl overflow-hidden hover:scale-105 transition-all shadow-[0_0_30px_#00ff4130]">
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span class="relative flex items-center gap-2">
                    <span class="material-icons-outlined">sports_soccer</span>
                    FIND MATCH
                </span>
            </button>
            
            <router-link to="/public-games" class="px-8 py-4 bg-green-700 text-white font-display font-bold text-lg rounded-xl border border-green-500/30 hover:bg-green-600 hover:border-green-400/50 transition-all flex items-center gap-2 shadow-lg">
                <Globe class="w-5 h-5 text-white" />
                PUBLIC GAMES
            </router-link>
            
            <router-link to="/team-builder" class="px-8 py-4 bg-gray-800 text-white font-display font-bold text-lg rounded-xl border border-white/10 hover:bg-gray-700 hover:border-white/30 transition-all flex items-center gap-2">
                <span class="material-icons-outlined text-field-accent">edit</span>
                MANAGE SQUAD
            </router-link>
            
            <router-link to="/shop" class="px-8 py-4 bg-gradient-to-r from-purple-900 to-purple-800 text-white font-display font-bold text-lg rounded-xl border border-white/10 hover:from-purple-800 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg">
                <span class="material-icons-outlined text-yellow-400">shopping_bag</span>
                STORE
            </router-link>
        </div>

      </div>
    </main>

    <!-- Player Detail Overlay -->
    <PlayerDetailView 
        v-if="selectedCard" 
        :card="selectedCard" 
        @close="selectedCard = null" 
        @sold="onCardSold"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/Sidebar.vue';
import PlayerCard from '../components/PlayerCard.vue';
import PlayerDetailView from '../components/PlayerDetailView.vue';

import { Coins, Globe, Edit, X, Dices } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const team = ref(null);
const coins = ref(0);
const selectedCard = ref(null);

// Edit Profile State
const isEditProfileOpen = ref(false);
const editUsername = ref('');
const editAvatarUrl = ref('');
const editError = ref('');
const isSaving = ref(false);

const username = computed(() => authStore.user?.username || 'Coach');

const openDetail = (card) => {
    if (card && card.id) {
        selectedCard.value = card;
    }
};

const onCardSold = (data) => {
    selectedCard.value = null;
    fetchUserData(); // Refresh to update coins and squad
};
const formattedCoins = computed(() => coins.value.toLocaleString());

const userAvatar = computed(() => {
    if (authStore.user?.avatar_url) return authStore.user.avatar_url;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.value}`;
});

const previewAvatar = computed(() => {
    if (designMode.value) return builtAvatarUrl.value;
    if (editAvatarUrl.value) return editAvatarUrl.value;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${editUsername.value || 'preview'}`;
});

const openEditProfile = () => {
    editUsername.value = authStore.user?.username || '';
    editAvatarUrl.value = authStore.user?.avatar_url || '';
    editError.value = '';
    isEditProfileOpen.value = true;
};

// Avatar Designer Options
const skinColors = ['f8d25c', 'fd9841', 'ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335'];
const topStyles = [
    { label: 'Short Hair', value: 'shortFlat' },
    { label: 'Long Hair', value: 'longButNotTooLong' },
    { label: 'Curly', value: 'curly' },
    { label: 'Fro', value: 'fro' },
    { label: 'Dreads', value: 'dreads' },
    { label: 'Hat', value: 'hat' },
    { label: 'Winter Hat', value: 'winterHat02' },
    { label: 'Turban', value: 'turban' },
    { label: 'Hijab', value: 'hijab' },
];
const clothingStyles = [
    { label: 'Hoodie', value: 'hoodie' },
    { label: 'Blazer', value: 'blazerAndShirt' },
    { label: 'Sweater', value: 'collarAndSweater' },
    { label: 'T-Shirt', value: 'graphicShirt' },
    { label: 'V-Neck', value: 'shirtVNeck' },
    { label: 'Overall', value: 'overall' },
];
const accessoriesInterceptor = [
    { label: 'None', value: 'none' }, // will require special handling or just empty
    { label: 'Glasses', value: 'prescription02' },
    { label: 'Sunglasses', value: 'sunglasses' },
    { label: 'Round', value: 'round' },
    { label: 'Wayfarers', value: 'wayfarers' },
];
const mouthStyles = [
    { label: 'Smile', value: 'smile' },
    { label: 'Sad', value: 'sad' },
    { label: 'Serious', value: 'serious' },
    { label: 'Default', value: 'default' },
    { label: 'Twinkle', value: 'twinkle' },
    { label: 'Tongue', value: 'tongue' },
    { label: 'Scream', value: 'screamOpen' },
    { label: 'Eating', value: 'eating' },
    { label: 'Vomit', value: 'vomit' },
];
const eyesStyles = [
    { label: 'Default', value: 'default' },
    { label: 'Happy', value: 'happy' },
    { label: 'Wink', value: 'wink' },
    { label: 'Wink Wacky', value: 'winkWacky' },
    { label: 'Surprised', value: 'surprised' },
    { label: 'Squint', value: 'squint' },
    { label: 'Side', value: 'side' },
    { label: 'Cry', value: 'cry' },
    { label: 'Heart', value: 'hearts' },
    { label: 'Eye Roll', value: 'eyeRoll' },
];
const eyebrowStyles = [
    { label: 'Default', value: 'default' },
    { label: 'Default Natural', value: 'defaultNatural' },
    { label: 'Angry', value: 'angry' },
    { label: 'Angry Natural', value: 'angryNatural' },
    { label: 'Flat Natural', value: 'flatNatural' },
    { label: 'Raised Excited', value: 'raisedExcited' },
    { label: 'Raised Excited Natural', value: 'raisedExcitedNatural' },
    { label: 'Sad Concerned', value: 'sadConcerned' },
    { label: 'Sad Concerned Natural', value: 'sadConcernedNatural' },
    { label: 'Unibrow Natural', value: 'unibrowNatural' },
    { label: 'Up Down', value: 'upDown' },
    { label: 'Up Down Natural', value: 'upDownNatural' },
    { label: 'Frown Natural', value: 'frownNatural' },
];

const hairColors = [
    '2c1b18', '4a312c', '724133', 'a55728', 'd6b370', 'f59797', 'ecdcbf', 'b58143', 'e8e1e1'
];
const clothesColors = [
    '262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', '3c4f5c', 'b1e2ff', 'ff5c5c', 'ffb0b0'
];

const selectedSkin = ref(skinColors[2]);
const selectedTop = ref('shortFlat');
const selectedTopColor = ref(hairColors[1]);
const selectedClothing = ref('hoodie');
const selectedClothingColor = ref(clothesColors[2]);
const selectedAccessory = ref('none');
const selectedMouth = ref('smile');
const selectedEyes = ref('default');
const selectedEyebrows = ref('default');
const designMode = ref(false);

const toggleDesignMode = () => {
    designMode.value = !designMode.value;
    if (designMode.value) {
        editAvatarUrl.value = ''; // Clear explicit URL to rely on builder
    }
};

const builtAvatarUrl = computed(() => {
    let url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${editUsername.value || 'preview'}`;
    url += `&skinColor=${selectedSkin.value}`;
    url += `&top=${selectedTop.value}`;
    url += `&hairColor=${selectedTopColor.value}`;
    url += `&clothing=${selectedClothing.value}`;
    url += `&clothesColor=${selectedClothingColor.value}`;
    url += `&mouth=${selectedMouth.value}`;
    url += `&eyes=${selectedEyes.value}`;
    url += `&eyebrows=${selectedEyebrows.value}`;
    if (selectedAccessory.value !== 'none') {
        url += `&accessories=${selectedAccessory.value}`;
        url += `&accessoriesProbability=100`;
    } else {
        url += `&accessoriesProbability=0`;
    }
    return url;
});

const fileInput = ref(null);

const randomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    editAvatarUrl.value = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

const triggerFileUpload = () => {
    fileInput.value.click();
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 100) { // 100kb limit
        editError.value = 'Image too large (max 100kb). Please use a smaller image.';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Create an image to resize/compress validation if needed
        // For now directly use base64
        editAvatarUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

const saveProfile = async () => {
    if (!editUsername.value) {
        editError.value = 'Username cannot be empty';
        return;
    }
    
    isSaving.value = true;
    editError.value = '';
    
    const success = await authStore.updateProfile({
        username: editUsername.value,
        avatarUrl: designMode.value ? builtAvatarUrl.value : editAvatarUrl.value
    });
    
    if (success) {
        isEditProfileOpen.value = false;
    } else {
        editError.value = authStore.error || 'Failed to update';
    }
    isSaving.value = false;
};

// Separated squad for layout
const goalkeeper = ref(null);
const defenders = ref([]);
const midfielders = ref([]);        // Defensive midfielders in 5-row formations
const attackingMidfielders = ref([]); // Attacking midfielders (for 4-2-3-1 style)
const forwards = ref([]);
const substitutes = ref([]);        // Bench players
const hasFiveRows = ref(false);     // Track if we're showing a 5-row formation

const getCardRarity = (rating) => {
    if (rating >= 85) return 'gold-rare';   // 85+: Gold Rare
    if (rating >= 76) return 'gold';        // 84-76: Gold
    if (rating >= 69) return 'silver-rare'; // 75-69: Silver Rare
    if (rating >= 59) return 'silver';      // 68-59: Silver
    if (rating >= 54) return 'bronze-rare'; // 58-54: Bronze Rare
    return 'bronze';                        // 53-: Bronze
};

const fetchUserData = async () => {
    try {
        // Fetch Coins
        const coinsRes = await fetch('/api/coins', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (coinsRes.ok) {
            const data = await coinsRes.json();
            coins.value = data.coins;
        }

        // Fetch Team
        const teamRes = await fetch('/api/teams', { // Use teams endpoint to detect ANY team
             headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        
        let myTeam = null;
        if (teamRes.ok) {
             const teams = await teamRes.json();
             if (teams.length > 0) myTeam = teams[0];
        }

        // If not found via list, try legacy endpoint just in case
        if (!myTeam) {
             try {
                const teamRes2 = await fetch('/api/my-team', {
                    headers: { 'Authorization': `Bearer ${authStore.token}` }
                });
                if (teamRes2.ok) myTeam = await teamRes2.json();
             } catch(e) {}
        }
        
        if (myTeam) {
            team.value = myTeam;
            // Need to populate players if they are just IDs or if we need detailed info
            // The list endpoint returns card_ids (array of numbers), but my-team returned fully object?
            // Let's check `sqlite.js` getAllUserTeams returns card_ids as array of IDs.
            // But `cardManager.getUserTeam` returns FULL objects.
            // If we used `getAllUserTeams` route (/api/my-teams) we need to hydrate.
            // For dashboard display we need hydration.
            // Let's use `createTeam` view logic or fetch specific team by ID if we have it.
            // Actually, /api/my-team (singular) returns hydrated team. 
            // The updated server/index.js kept /api/my-team route. 
            
            // Wait, I see I modified /api/my-team in server/index.js? 
            // No, I only touched /api/profile.
            
            // Re-read server/index.js to be sure about /api/my-team behavior.
            // It calls `cardManager.getUserTeam(req.user.id)`.
            
        }

        // Fetch Team (Legacy/Hydrated) 
        // We really want the hydrated one for the visual pitch.
        const hydratedRes = await fetch('/api/my-team', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        
        if (hydratedRes.ok) {
            const data = await hydratedRes.json();
            team.value = data;
            organizeSquad(data.players || [], data.formation);
        } else {
             team.value = null; 
        }

    } catch (e) {
        console.error('Failed to load dashboard data:', e);
    } finally {
        loading.value = false;
    }
};

const organizeSquad = (players, formation = null) => {
    // Reset
    goalkeeper.value = null;
    defenders.value = [];
    midfielders.value = [];
    attackingMidfielders.value = [];
    forwards.value = [];
    substitutes.value = [];
    hasFiveRows.value = false;

    // Filter nulls just in case
    const validPlayers = players.filter(p => p && p.position);
    
    // First 11 are starters, rest are subs
    const starters = validPlayers.slice(0, 11);
    const subs = validPlayers.slice(11);
    
    substitutes.value = subs;

    // Formations with separate DM/AM rows
    const fiveRowFormations = [
        '4-2-3-1', '4-1-4-1', '4-3-2-1', '3-1-4-2', 
        '4-1-2-1-2', '4-1-2-1-2 (2)', '4-2-2-2', 
        '5-2-1-2', '3-4-1-2', '3-4-2-1'
    ];
    
    if (formation && fiveRowFormations.includes(formation)) {
        hasFiveRows.value = true;
        
        // Define row assignments
        const deepCMFormations = ['4-1-4-1', '3-1-4-2']; // CMs are HIGH (Row 2) for these
        const deepWingersFormations = ['3-4-1-2', '3-4-2-1', '5-4-1']; // LM/RM are DEEP (Row 3) for these

        starters.forEach(p => {
            const slot = p.assignedSlot || p.position;
            
            if (slot === 'GK') {
                if (!goalkeeper.value) goalkeeper.value = p;
                else defenders.value.push(p);
            } else if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DF'].includes(slot)) {
                defenders.value.push(p);
            } else if (slot === 'CDM') {
                midfielders.value.push(p);
            } else if (['CAM', 'CF'].includes(slot)) {
                attackingMidfielders.value.push(p);
            } else if (slot === 'CM') {
                // Check if CM should be high or deep
                if (deepCMFormations.includes(formation)) {
                    attackingMidfielders.value.push(p);
                } else {
                    midfielders.value.push(p); // Default deep for diamond/compact
                }
            } else if (['LM', 'RM'].includes(slot)) {
                // Check if Wingers should be high or deep
                if (deepWingersFormations.includes(formation)) {
                    midfielders.value.push(p);
                } else {
                    attackingMidfielders.value.push(p); // Default high
                }
            } else if (slot === 'MF') {
                 midfielders.value.push(p);
            } else {
                forwards.value.push(p); // ST, LW, RW, FW
            }
        });
    } else {
        // Standard 4-row layout
        starters.forEach(p => {
            const pos = p.assignedSlot || p.position;

            if (pos === 'GK') {
                if (!goalkeeper.value) goalkeeper.value = p;
                else defenders.value.push(p); // Overflow
            } else if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DF'].includes(pos)) {
                defenders.value.push(p);
            } else if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MF'].includes(pos)) {
                midfielders.value.push(p);
            } else {
                forwards.value.push(p); // ST, CF, LW, RW, FW
            }
        });
    }
};

const getFormationX = (index, total) => {
    // Dynamically adjust spacing to fit within 80% width max
    // Base spacing 20%, but reduce if total * 20 > 80
    const maxWidth = 85; 
    let spacing = 22;
    
    if (total > 1) {
       const needed = (total - 1) * spacing;
       if (needed > maxWidth) {
           spacing = maxWidth / (total - 1);
       }
    }

    const center = 50;
    const start = center - ((total - 1) * spacing) / 2;
    return start + (index * spacing);
};

const startGame = () => {
    const sessionId = Math.random().toString(36).substring(7).toUpperCase();
    router.push(`/game/${sessionId}`);
};

onMounted(() => {
    if (!authStore.isAuthenticated) {
        router.push('/');
        return;
    }
    fetchUserData();
});
</script>

<style>
/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

