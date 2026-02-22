<template>
    <div class="fixed inset-0 z-50 h-screen w-screen flex flex-col bg-[#1a1b26] text-[#c0caf5] overflow-hidden selection:bg-[#f7768e]/30 font-sans">
        <!-- Header -->
        <div class="h-16 border-b border-[#414868]/50 flex items-center justify-between px-6 bg-[#1a1b26]/50 backdrop-blur-md z-20 shrink-0">
            <div class="flex items-center gap-4">
                <button @click="router.push('/my-teams')" class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#414868] text-[#7aa2f7] hover:text-[#bb9af7] transition-all active:scale-95 group">
                    <span class="material-icons-outlined text-2xl group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                </button>
                <div>
                    <h1 class="text-xl font-bold bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] bg-clip-text text-transparent transform translate-y-px">Team Builder</h1>
                    <p class="text-[10px] text-[#565f89] font-bold uppercase tracking-widest mt-0.5">Tokyo Night Edition</p>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <!-- Team Name Input -->
                <div class="flex items-center gap-3 bg-[#24283b] px-4 py-2 rounded-xl border border-[#414868] shadow-lg shadow-[#1a1b26]/50 group focus-within:border-[#7aa2f7] focus-within:shadow-[0_0_15px_rgba(122,162,247,0.2)] transition-all">
                    <span class="material-icons-outlined text-[#565f89] group-focus-within:text-[#7aa2f7] transition-colors text-lg">badge</span>
                    <input 
                        v-model="teamName"
                        type="text" 
                        placeholder="Enter team name..."
                        maxlength="30"
                        class="bg-transparent text-sm font-bold text-[#c0caf5] focus:outline-none placeholder:text-[#565f89] w-48"
                    />
                    <span class="text-[10px] text-[#565f89] font-mono">{{ teamName.length }}/30</span>
                </div>

                <div class="h-8 w-px bg-[#414868] mx-2"></div>

                <div class="flex items-center gap-3 bg-[#24283b] px-4 py-2 rounded-xl border border-[#414868] shadow-lg shadow-[#1a1b26]/50">
                    <span class="text-[10px] text-[#565f89] uppercase tracking-wider font-bold">Formation</span>
                    <select 
                        v-model="selectedFormation" 
                        @change="changeFormation($event.target.value)"
                        class="bg-transparent text-sm font-bold text-[#7aa2f7] focus:outline-none cursor-pointer uppercase tracking-wide"
                    >
                        <option v-for="(layout, name) in FORMATIONS" :key="name" :value="name" class="bg-[#24283b] text-[#c0caf5]">
                            {{ name }}
                        </option>
                    </select>
                </div>

                <div class="h-8 w-px bg-[#414868] mx-2"></div>

                <button 
                    @click="saveTeam" 
                    :disabled="loading || !isValidTeam"
                    class="px-8 py-2.5 bg-[#7aa2f7] text-[#1a1b26] font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#bb9af7] transition-all shadow-[0_0_20px_rgba(122,162,247,0.3)] hover:shadow-[0_0_25px_rgba(187,154,247,0.5)] active:scale-95 flex items-center gap-2 group"
                >
                    <span v-if="loading" class="animate-pulse">Saving...</span>
                    <span v-else class="group-hover:tracking-wide transition-all duration-300">Save Squad</span>
                </button>
            </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-[#f7768e]/10 border-b border-[#f7768e]/20 p-3 text-center animate-fadeIn">
            <p class="text-[#f7768e] text-sm font-bold flex items-center justify-center gap-2">
                <span class="material-icons-outlined text-sm">error</span>
                {{ error }}
            </p>
        </div>

        <!-- Info Message -->
        <div v-if="infoMessage" class="bg-[#7aa2f7]/10 border-b border-[#7aa2f7]/20 p-3 text-center animate-fadeIn">
            <p class="text-[#7aa2f7] text-sm font-bold flex items-center justify-center gap-2">
                <span class="material-icons-outlined text-sm">info</span>
                {{ infoMessage }}
            </p>
        </div>

        <div class="flex-1 overflow-hidden flex">
            <!-- Left Column: Player Collection -->
            <div class="w-80 lg:w-96 border-r border-[#414868]/30 flex flex-col bg-[#16161e] shrink-0 z-20 shadow-2xl">
                <div class="p-4 border-b border-[#414868]/30 space-y-3">
                    <!-- Search Bar -->
                    <div class="relative group">
                        <span class="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89] group-focus-within:text-[#7aa2f7] transition-colors">search</span>
                        <input 
                            v-model="playerFilters.name"
                            type="text" 
                            placeholder="Search by name..." 
                            class="w-full bg-[#24283b] border border-[#414868] rounded-xl pl-10 pr-4 py-3 text-sm text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] focus:ring-1 focus:ring-[#7aa2f7] transition-all placeholder:text-[#565f89]"
                        />
                    </div>

                    <!-- Filter Toggle Button -->
                    <button 
                        @click="showPlayerFilters = !showPlayerFilters"
                        class="w-full bg-[#24283b] border border-[#414868] rounded-xl px-4 py-2 text-sm text-[#c0caf5] hover:border-[#7aa2f7] transition-all flex items-center justify-between"
                    >
                        <span class="flex items-center gap-2">
                            <span class="material-icons-outlined text-base">filter_list</span>
                            <span class="font-bold">Filters</span>
                        </span>
                        <span class="material-icons-outlined text-base transition-transform" :class="{'rotate-180': showPlayerFilters}">expand_more</span>
                    </button>

                    <!-- Advanced Filters (Collapsible) -->
                    <div v-if="showPlayerFilters" class="space-y-2 animate-fadeIn">
                        <select v-model="playerFilters.position" @change="showPlayerFilters = false" class="w-full bg-[#24283b] border border-[#414868] rounded-xl px-3 py-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]">
                            <option value="">All Positions</option>
                            <option value="GK">GK</option>
                            <option value="CB">CB</option>
                            <option value="LB">LB</option>
                            <option value="RB">RB</option>
                            <option value="LWB">LWB</option>
                            <option value="RWB">RWB</option>
                            <option value="CDM">CDM</option>
                            <option value="CM">CM</option>
                            <option value="CAM">CAM</option>
                            <option value="LM">LM</option>
                            <option value="RM">RM</option>
                            <option value="LW">LW</option>
                            <option value="RW">RW</option>
                            <option value="ST">ST</option>
                            <option value="CF">CF</option>
                        </select>

                        <input v-model="playerFilters.nationality" @change="showPlayerFilters = false" type="text" placeholder="Nationality" class="w-full bg-[#24283b] border border-[#414868] rounded-xl px-3 py-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] placeholder:text-[#565f89]" />
                        <input v-model="playerFilters.league" @change="showPlayerFilters = false" type="text" placeholder="League" class="w-full bg-[#24283b] border border-[#414868] rounded-xl px-3 py-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] placeholder:text-[#565f89]" />
                        <input v-model="playerFilters.team" @change="showPlayerFilters = false" type="text" placeholder="Club" class="w-full bg-[#24283b] border border-[#414868] rounded-xl px-3 py-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] placeholder:text-[#565f89]" />
                        
                        <select v-model="playerFilters.type" @change="showPlayerFilters = false" class="w-full bg-[#24283b] border border-[#414868] rounded-xl px-3 py-2 text-xs text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]">
                            <option value="">All Types</option>
                            <option value="bronze">Bronze (< 70)</option>
                            <option value="silver">Silver (70-79)</option>
                            <option value="gold">Gold (80-89)</option>
                            <option value="special">Special (90+)</option>
                        </select>

                        <button @click="clearPlayerFilters" class="w-full bg-[#f7768e]/20 hover:bg-[#f7768e]/30 text-[#f7768e] rounded-xl px-3 py-2 text-xs font-bold transition-all">
                            Clear Filters
                        </button>
                    </div>
                </div>
                
                <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <div class="grid grid-cols-2 gap-3">
                        <div 
                            v-for="card in filteredAvailablePlayers" 
                            :key="card.id"
                            @click="openDetail(card)"
                            class="aspect-[3/4] cursor-pointer relative group transition-all duration-300"
                            :class="{'ring-2 ring-[#e0af68] scale-[1.02] z-10 shadow-[0_0_15px_rgba(224,175,104,0.3)]': pendingPlayer?.id === card.id, 'opacity-40 grayscale blur-[1px]': pendingPlayer && pendingPlayer.id !== card.id}"
                        >
                            <PlayerCardSlot :player="card" />
                            <div 
                                @click.stop="selectPlayer(card)"
                                class="absolute inset-0 bg-[#7aa2f7]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-lg backdrop-blur-[2px]"
                            >
                                <span class="text-xs font-bold uppercase tracking-wider text-[#1a1b26] bg-white px-3 py-1 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">Select</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content: Pitch & Bench -->
            <div class="flex-1 flex flex-col relative bg-[#1a1b26]">
                <!-- Background Pattern -->
                <div class="absolute inset-0 opacity-10 bg-[url('/assets/pattern.svg')] bg-repeat pointer-events-none"></div>
                
                <!-- Pitch Area -->
                <div class="relative z-10 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center p-8">
                    <!-- Stylized Pitch -->
                    <div class="my-auto relative w-full max-w-[650px] aspect-[2/3] lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(122,162,247,0.1)] border border-[#414868]/50 bg-gradient-to-b from-[#1f2335] to-[#1a1b26] shrink-0">
                        
                        <!-- Grass Stripes (Subtle) -->
                        <div class="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_49px,#ffffff_50px)] pointer-events-none"></div>

                        <!-- Pitch Lines (Neon) -->
                        <div class="absolute inset-0 pointer-events-none">
                            <div class="absolute top-0 left-0 right-0 h-full border-2 border-[#414868]/40 m-6 rounded-lg opacity-60"></div>
                            
                            <!-- Halfway Line -->
                            <div class="absolute top-1/2 left-6 right-6 h-px bg-[#414868]/40 transform -translate-y-1/2 shadow-[0_0_10px_rgba(122,162,247,0.2)]"></div>
                            
                            <!-- Center Circle -->
                            <div class="absolute top-1/2 left-1/2 w-32 h-32 border border-[#414868]/40 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(122,162,247,0.1)]"></div>
                            
                            <!-- Penalty Areas -->
                            <div class="absolute top-6 left-1/2 w-48 h-24 border-b border-l border-r border-[#414868]/40 transform -translate-x-1/2 bg-[#7aa2f7]/5"></div>
                            <div class="absolute bottom-6 left-1/2 w-48 h-24 border-t border-l border-r border-[#414868]/40 transform -translate-x-1/2 bg-[#7aa2f7]/5"></div>

                            <!-- Goals (Visual only) -->
                            <div class="absolute -top-1 left-1/2 w-24 h-4 border border-[#414868]/60 bg-[#7aa2f7]/10 transform -translate-x-1/2 rounded-b-md"></div>
                            <div class="absolute -bottom-1 left-1/2 w-24 h-4 border border-[#414868]/60 bg-[#7aa2f7]/10 transform -translate-x-1/2 rounded-t-md"></div>
                        </div>

                        <!-- Formation Grid -->
                        <div class="absolute inset-0 flex flex-col py-10 px-6 justify-between z-20">
                            
                            <!-- FW Row -->
                            <div class="flex justify-around items-center h-1/5 w-full px-8">
                                <div v-for="(slotType, i) in getSlots('FW')" :key="'FW'+i" class="w-24 h-32 transform hover:-translate-y-1 transition-transform duration-300">
                                    <PlayerCardSlot 
                                        :player="squad.FW[i]" 
                                        :type="slotType"
                                        :isCaptain="squad.FW[i]?.id === captainId"
                                        :kitNumber="squad.FW[i] ? kitNumbers[String(squad.FW[i].id||squad.FW[i].cardId)] : null"
                                        @click="handleSlotClick('FW', i)"
                                        @remove="removePlayer('FW', i)"
                                        @toggleCaptain="toggleCaptain(squad.FW[i])"
                                        @editKit="openKitEditor(squad.FW[i])"
                                    />
                                </div>
                            </div>

                            <!-- AM Row -->
                            <div v-if="hasDMRow" class="flex justify-around items-center h-1/5 w-full px-6">
                                <div v-for="(slotType, i) in getSlots('AM')" :key="'AM'+i" class="w-24 h-32 transform hover:-translate-y-1 transition-transform duration-300">
                                    <PlayerCardSlot 
                                        :player="squad.AM[i]" 
                                        :type="slotType"
                                        :isCaptain="squad.AM[i]?.id === captainId"
                                        :kitNumber="squad.AM[i] ? kitNumbers[String(squad.AM[i].id||squad.AM[i].cardId)] : null"
                                        @click="handleSlotClick('AM', i)"
                                        @remove="removePlayer('AM', i)"
                                        @toggleCaptain="toggleCaptain(squad.AM[i])"
                                        @editKit="openKitEditor(squad.AM[i])"
                                    />
                                </div>
                            </div>

                            <!-- MF Row -->
                            <div class="flex justify-around items-center h-1/5 w-full px-6">
                                <div v-for="(slotType, i) in getSlots('MF')" :key="'MF'+i" class="w-24 h-32 transform hover:-translate-y-1 transition-transform duration-300">
                                    <PlayerCardSlot 
                                        :player="squad.MF[i]" 
                                        :type="slotType"
                                        :isCaptain="squad.MF[i]?.id === captainId"
                                        :kitNumber="squad.MF[i] ? kitNumbers[String(squad.MF[i].id||squad.MF[i].cardId)] : null"
                                        @click="handleSlotClick('MF', i)"
                                        @remove="removePlayer('MF', i)"
                                        @toggleCaptain="toggleCaptain(squad.MF[i])"
                                        @editKit="openKitEditor(squad.MF[i])"
                                    />
                                </div>
                            </div>

                            <!-- DF Row -->
                            <div class="flex justify-around items-center h-1/5 w-full px-4">
                                <div v-for="(slotType, i) in getSlots('DF')" :key="'DF'+i" class="w-24 h-32 transform hover:-translate-y-1 transition-transform duration-300">
                                    <PlayerCardSlot 
                                        :player="squad.DF[i]" 
                                        :type="slotType"
                                        :isCaptain="squad.DF[i]?.id === captainId"
                                        :kitNumber="squad.DF[i] ? kitNumbers[String(squad.DF[i].id||squad.DF[i].cardId)] : null"
                                        @click="handleSlotClick('DF', i)"
                                        @remove="removePlayer('DF', i)"
                                        @toggleCaptain="toggleCaptain(squad.DF[i])"
                                        @editKit="openKitEditor(squad.DF[i])"
                                    />
                                </div>
                            </div>

                            <!-- GK Row -->
                            <div class="flex justify-center items-center h-1/5 w-full">
                                <div class="w-24 h-32 transform hover:-translate-y-1 transition-transform duration-300 relative">
                                    <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/40 blur-sm rounded-full"></div>
                                    <PlayerCardSlot 
                                        :player="squad.GK[0]" 
                                        type="GK"
                                        :isCaptain="squad.GK[0]?.id === captainId"
                                        :kitNumber="squad.GK[0] ? kitNumbers[String(squad.GK[0].id||squad.GK[0].cardId)] : null"
                                        @click="handleSlotClick('GK', 0)"
                                        @remove="removePlayer('GK', 0)"
                                        @toggleCaptain="toggleCaptain(squad.GK[0])"
                                        @editKit="openKitEditor(squad.GK[0])"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                
                <!-- Bench Section -->
                <div class="h-48 bg-[#16161e] border-t border-[#414868]/30 shrink-0 z-20 flex flex-col shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
                    <div class="px-6 py-3 border-b border-[#414868]/20 flex justify-between items-center bg-[#1a1b26]">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-full bg-[#9ece6a]"></span>
                            <h3 class="text-xs font-bold text-[#c0caf5] uppercase tracking-wider">Substitutes</h3>
                        </div>
                        <span class="text-xs font-mono text-[#565f89]">{{ squad.BENCH.filter(p => p).length }} / 9</span>
                    </div>
                    <div class="flex-1 overflow-x-auto custom-scrollbar flex items-center px-6 gap-4 py-2">
                        <div v-for="(player, i) in squad.BENCH" :key="'BENCH'+i" class="w-24 h-32 shrink-0 transform hover:-translate-y-1 transition-transform duration-200">
                            <PlayerCardSlot 
                                :player="player" 
                                type="SUB"
                                :isCaptain="player?.id === captainId"
                                :kitNumber="player ? kitNumbers[String(player.id||player.cardId)] : null"
                                @click="handleSlotClick('BENCH', i)"
                                @remove="removePlayer('BENCH', i)"
                                @toggleCaptain="toggleCaptain(player)"
                                @editKit="openKitEditor(player)"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Player Detail Overlay -->
        <PlayerDetailView 
            v-if="selectedCard" 
            :card="selectedCard" 
            @close="selectedCard = null" 
        />

        <!-- Kit Number Editor Overlay -->
        <div v-if="editingKitPlayer" class="absolute inset-0 bg-[#000000]/80 z-[60] flex items-center justify-center backdrop-blur-sm animate-fadeIn">
            <div class="bg-[#24283b] border border-[#414868] rounded-2xl p-8 w-full max-w-sm shadow-2xl transform scale-100 transition-all">
                <h3 class="text-xl font-bold text-[#7aa2f7] mb-6 text-center">Assign Kit Number</h3>
                
                <div class="flex justify-center mb-8 transform scale-110">
                   <PlayerCardSlot :player="editingKitPlayer" :type="editingKitPlayer.position" />
                </div>

                <div class="mb-8">
                    <label class="block text-[10px] font-bold text-[#565f89] uppercase tracking-wider mb-3 text-center">Number (0-99)</label>
                    <div class="relative w-24 mx-auto">
                        <input 
                            ref="kitInput"
                            v-model="pendingKitNumber"
                            type="number" 
                            min="0" 
                            max="99" 
                            class="w-full bg-[#1a1b26] border-2 border-[#414868] rounded-xl px-2 py-4 text-4xl font-mono text-center text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] focus:ring-4 focus:ring-[#7aa2f7]/20 transition-all shadow-inner"
                            @keydown.enter="saveKitNumber"
                        />
                    </div>
                    <p class="text-[10px] text-[#565f89] mt-3 text-center">Set to 0 to clear</p>
                </div>

                <div class="flex gap-3">
                    <button 
                        @click="closeKitEditor" 
                        class="flex-1 px-4 py-3 bg-[#414868] text-[#c0caf5] font-bold rounded-xl hover:bg-[#565f89] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        @click="saveKitNumber" 
                        class="flex-1 px-4 py-3 bg-[#7aa2f7] text-[#1a1b26] font-bold rounded-xl hover:bg-[#bb9af7] transition-colors shadow-lg shadow-[#7aa2f7]/20"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onErrorCaptured } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PlayerCardSlot from '../components/builder/PlayerCardSlot.vue'; 
import PlayerDetailView from '../components/PlayerDetailView.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onErrorCaptured((err) => {
    console.error("CreateSquadView Error:", err);
    error.value = "System Malfunction: " + err.message;
    return false;
});

const teamName = ref('');
const loading = ref(false);
const error = ref('');
const infoMessage = ref('');
const allCards = ref([]);
const isEditing = ref(false);
const editingTeamId = ref(null);
const selectedCard = ref(null);
const captainId = ref(null);
const kitInput = ref(null);

const FORMATIONS = {
    '4-4-2': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['LM', 'CM', 'CM', 'RM'], 
        FW: ['ST', 'ST'] 
    },
    '4-3-3': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CM', 'CM', 'CM'],
        FW: ['LW', 'ST', 'RW'] 
    },
    '5-3-2': { 
        DF: ['LWB', 'CB', 'CB', 'CB', 'RWB'], 
        MF: ['CM', 'CM', 'CM'], 
        FW: ['ST', 'ST'] 
    },
    '3-5-2': { 
        DF: ['CB', 'CB', 'CB'], 
        MF: ['LM', 'CDM', 'CM', 'CDM', 'RM'], 
        FW: ['ST', 'ST'] 
    },
    '4-2-4': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CM', 'CM'], 
        FW: ['LW', 'ST', 'ST', 'RW'] 
    },
    '4-5-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['LM', 'CM', 'CM', 'CM', 'RM'], 
        FW: ['ST'] 
    },
    '3-4-3': { 
        DF: ['CB', 'CB', 'CB'], 
        MF: ['LM', 'CM', 'CM', 'RM'], 
        FW: ['LW', 'ST', 'RW'] 
    },
    '4-2-3-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CDM', 'CDM'],           
        AM: ['LM', 'CAM', 'RM'],      
        FW: ['ST'] 
    },
    '4-1-4-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CDM'],                  
        AM: ['LM', 'CM', 'CM', 'RM'], 
        FW: ['ST'] 
    },
    '4-3-2-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CM', 'CM', 'CM'],       
        AM: ['CAM', 'CAM'],           
        FW: ['ST'] 
    },
    '3-1-4-2': { 
        DF: ['CB', 'CB', 'CB'], 
        MF: ['CDM'],                  
        AM: ['LM', 'CM', 'CM', 'RM'], 
        FW: ['ST', 'ST'] 
    },
    '4-1-2-1-2': {
        DF: ['LB', 'CB', 'CB', 'RB'],
        MF: ['LM', 'CDM', 'RM'],
        AM: ['CAM'],
        FW: ['ST', 'ST']
    },
    '4-1-2-1-2 (2)': {
        DF: ['LB', 'CB', 'CB', 'RB'],
        MF: ['CM', 'CDM', 'CM'],
        AM: ['CAM'],
        FW: ['ST', 'ST']
    },
    '4-2-2-2': {
        DF: ['LB', 'CB', 'CB', 'RB'],
        MF: ['CDM', 'CDM'],
        AM: ['CAM', 'CAM'],
        FW: ['ST', 'ST']
    },
    '5-4-1': {
        DF: ['LWB', 'CB', 'CB', 'CB', 'RWB'],
        MF: ['LM', 'CM', 'CM', 'RM'],
        FW: ['ST']
    },
    '5-2-1-2': {
        DF: ['LWB', 'CB', 'CB', 'CB', 'RWB'],
        MF: ['CM', 'CM'],
        AM: ['CAM'],
        FW: ['ST', 'ST']
    },
    '3-4-1-2': {
        DF: ['CB', 'CB', 'CB'],
        MF: ['LM', 'CM', 'CM', 'RM'],
        AM: ['CAM'],
        FW: ['ST', 'ST']
    },
    '3-4-2-1': {
        DF: ['CB', 'CB', 'CB'],
        MF: ['LM', 'CM', 'CM', 'RM'],
        AM: ['CAM', 'CAM'],
        FW: ['ST']
    }
};

const selectedFormation = ref('4-4-2');

const squad = ref({
    GK: [null],
    DF: [null, null, null, null],
    MF: [null, null, null, null],
    AM: [],  
    FW: [null, null],
    BENCH: Array(9).fill(null)
});

const hasDMRow = computed(() => {
    return !!FORMATIONS[selectedFormation.value]?.AM;
});

const getSlots = (pos) => {
    if (pos === 'GK') return ['GK'];
    const formation = FORMATIONS[selectedFormation.value];
    if (!formation) return [];
    const slots = formation[pos];
    return slots || [];
};

const isCompatible = (playerPos, slotPos) => {
    if (!playerPos || !slotPos) return false;
    if (playerPos === slotPos) return true;
    
    const compatibility = {
        'GK': [],
        'LB': ['LWB', 'DF'],
        'LWB': ['LB', 'DF'],
        'RB': ['RWB', 'DF'],
        'RWB': ['RB', 'DF'],
        'CB': ['DF'], 
        'CDM': ['CM', 'MF'],
        'CM': ['CDM', 'CAM', 'MF'],
        'CAM': ['CM', 'CF', 'MF'],
        'LM': ['LW', 'MF'],
        'RM': ['RW', 'MF'],
        'LW': ['LM', 'FW'], 
        'RW': ['RM', 'FW'], 
        'ST': ['CF', 'FW'], 
        'CF': ['ST', 'CAM', 'FW']
    };

    return compatibility[slotPos]?.includes(playerPos) || false;
};

const changeFormation = (newFormation) => {
    if (!FORMATIONS[newFormation]) return;

    const oldSquad = { ...squad.value };
    selectedFormation.value = newFormation;
    
    const formation = FORMATIONS[newFormation];
    
    const newDef = formation.DF.map(() => null);
    const newMid = formation.MF.map(() => null);
    const newAM = formation.AM ? formation.AM.map(() => null) : [];
    const newFwd = formation.FW.map(() => null);

    const newSquad = {
        GK: [oldSquad.GK[0]], 
        DF: newDef,
        MF: newMid,
        AM: newAM,
        FW: newFwd,
        BENCH: oldSquad.BENCH || Array(9).fill(null)
    };

    const allOldPlayers = [
        ...oldSquad.DF, ...oldSquad.MF, ...(oldSquad.AM || []), ...oldSquad.FW
    ].filter(p => p !== null);
    
    allOldPlayers.forEach(player => {
        const generics = ['DF', 'MF', 'AM', 'FW'];
        let placed = false;
        
        for (const gen of generics) {
            const slots = newSquad[gen];
            const slotTypes = formation[gen];
            if (!slots || !slotTypes) continue;
            
            for (let i = 0; i < slots.length; i++) {
                if (slots[i] === null && isCompatible(player.position, slotTypes[i])) {
                    newSquad[gen][i] = player;
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
    });

    squad.value = newSquad;
};

const openDetail = (card) => {
    selectedCard.value = card;
};

const onCardSold = (data) => {
    selectedCard.value = null;
    allCards.value = allCards.value.filter(c => c.id !== data.cardId);
    for (const pos in squad.value) {
        squad.value[pos] = squad.value[pos].map(p => (p && p.id === data.cardId) ? null : p);
    }
    if (captainId.value === data.cardId) {
        captainId.value = null;
    }
};

const occupiedCardIds = computed(() => {
    const ids = new Set();
    Object.values(squad.value).flat().forEach(p => {
        if (p) ids.add(p.id);
    });
    return ids;
});

const occupiedPlayerIds = computed(() => {
    const ids = new Set();
    Object.values(squad.value).flat().forEach(p => {
        const pid = p?.playerId || p?.player_id;
        if (pid) ids.add(pid);
    });
    return ids;
});

const playerFilters = ref({
    name: '',
    nationality: '',
    position: '',
    league: '',
    team: '',
    type: ''
});

const showPlayerFilters = ref(false);

const clearPlayerFilters = () => {
    playerFilters.value = {
        name: '',
        nationality: '',
        position: '',
        league: '',
        team: '',
        type: ''
    };
};

const getRatingRange = (type) => {
    switch (type?.toLowerCase()) {
        case 'bronze': return { min: 0, max: 69 };
        case 'silver': return { min: 70, max: 79 };
        case 'gold': return { min: 80, max: 89 };
        case 'special': return { min: 90, max: 100 };
        default: return null;
    }
};

const availablePlayers = computed(() => {
    return allCards.value
        .filter(c => {
            const pid = c.playerId || c.player_id;
            return !occupiedCardIds.value.has(c.id) && !occupiedPlayerIds.value.has(pid);
        })
        .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
});

const filteredAvailablePlayers = computed(() => {
    let result = availablePlayers.value;

    // Name filter
    if (playerFilters.value.name && playerFilters.value.name.length >= 2) {
        const lowerName = playerFilters.value.name.toLowerCase();
        result = result.filter(p => (p.name || p.real_name || '').toLowerCase().includes(lowerName));
    }

    // Nationality filter
    if (playerFilters.value.nationality) {
        const lowerNat = playerFilters.value.nationality.toLowerCase();
        result = result.filter(p => p.nationality && p.nationality.toLowerCase() === lowerNat);
    }

    // Position filter
    if (playerFilters.value.position) {
        result = result.filter(p => p.position === playerFilters.value.position);
    }

    // League filter
    if (playerFilters.value.league) {
        const lowerLeague = playerFilters.value.league.toLowerCase();
        result = result.filter(p => p.league && p.league.toLowerCase() === lowerLeague);
    }

    // Team filter
    if (playerFilters.value.team) {
        const lowerTeam = playerFilters.value.team.toLowerCase();
        result = result.filter(p => p.team && p.team.toLowerCase().includes(lowerTeam));
    }

    // Type/rarity filter
    if (playerFilters.value.type) {
        const range = getRatingRange(playerFilters.value.type);
        if (range) {
            result = result.filter(p => {
                const rating = p.overallRating || 0;
                return rating >= range.min && rating <= range.max;
            });
        }
    }

    return result;
});

const isValidTeam = computed(() => {
    const starters = [
        ...squad.value.GK,
        ...squad.value.DF,
        ...squad.value.MF,
        ...squad.value.AM || [],
        ...squad.value.FW
    ].filter(p => p !== null);
    
    return teamName.value.length > 2 && starters.length === 11 && captainId.value !== null;
});

const fetchCollection = async () => {
    if (!authStore.isAuthenticated) {
        router.push('/');
        return;
    }

    loading.value = true;
    try {
        const res = await fetch('/api/collection', {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch cards');

        const data = await res.json();
        allCards.value = data.map(c => ({
            ...c,
            position: c.position || guessPosition(c.player_id)
        }));

        if (route.query.teamId) {
            await loadTeam(route.query.teamId);
        }

    } catch (err) {
        console.error(err);
        error.value = "Failed to load collection";
    } finally {
        loading.value = false;
    }
};

const loadTeam = async (id) => {
    try {
        const res = await fetch(`/api/teams/${id}`, {
            headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (res.ok) {
            const team = await res.json();
            isEditing.value = true;
            editingTeamId.value = team.id;
            teamName.value = team.name;
            captainId.value = team.captain_id || null;
            if (team.kit_numbers) {
                const normalized = {};
                for (const [k, v] of Object.entries(team.kit_numbers)) {
                    normalized[String(k)] = v;
                }
                kitNumbers.value = normalized;
            } else {
                kitNumbers.value = {};
            }

            if (team.formation && FORMATIONS[team.formation]) {
                selectedFormation.value = team.formation;
            } else {
                selectedFormation.value = '4-4-2';
            }
            
            const formation = FORMATIONS[selectedFormation.value];
            squad.value = {
                GK: [null],
                DF: formation.DF.map(() => null),
                MF: formation.MF.map(() => null),
                AM: formation.AM ? formation.AM.map(() => null) : [],
                FW: formation.FW.map(() => null),
                BENCH: Array(9).fill(null)
            };

            const cardIdsToPlace = team.card_ids || [];
            
            // Map card IDs to actual player objects from collection
            // The order in cardIdsToPlace MUST meaningful:
            // It should be [GK, ...DFs, ...MFs, ...AMs, ...FWs, ...BENCH]
            
            let currentIndex = 0;
            
            // Helper to fill a specific section of the squad
            const fillSection = (sectionName) => {
                if (!squad.value[sectionName]) return;
                
                for (let i = 0; i < squad.value[sectionName].length; i++) {
                    if (currentIndex < cardIdsToPlace.length) {
                        const cardIdOrObj = cardIdsToPlace[currentIndex++];
                        if (cardIdOrObj) {
                            const id = typeof cardIdOrObj === 'object' ? cardIdOrObj.id : cardIdOrObj;
                            const player = allCards.value.find(p => p.id === id);
                            if (player) {
                                squad.value[sectionName][i] = player;
                            }
                        }
                    }
                }
            };

            // Fill slots in order: GK -> DF -> MF -> AM -> FW -> BENCH
            fillSection('GK');
            fillSection('DF');
            fillSection('MF');
            if (squad.value.AM) fillSection('AM');
            fillSection('FW');
            fillSection('BENCH');
        }
    } catch (err) {
        console.error("Failed to load team to edit", err);
        error.value = "Failed to load team";
    }
};

const guessPosition = (id) => {
    const hash = id.split('').reduce((a,b)=>a+b.charCodeAt(0),0);
    const r = hash % 100;
    if (r < 10) return 'GK';
    if (r < 40) return 'CB'; 
    if (r < 80) return 'CM'; 
    return 'ST'; 
};

const getGenericPosition = (specificPos) => {
    if (['ST', 'RW', 'LW', 'FW', 'CF', 'Forward', 'Attacker'].includes(specificPos)) return 'FW';
    if (['CM', 'CDM', 'CAM', 'RM', 'LM', 'MF', 'Midfielder'].includes(specificPos)) return 'MF';
    if (['CB', 'LB', 'RB', 'WB', 'LWB', 'RWB', 'DF', 'Defender'].includes(specificPos)) return 'DF';
    return 'GK'; 
};

const pendingPlayer = ref(null);

const selectPlayer = (player, force = false) => {
    if (pendingPlayer.value && pendingPlayer.value.id === player.id) {
        pendingPlayer.value = null;
        infoMessage.value = '';
        error.value = '';
        return;
    }

    // Set as pending player - user must click a slot to place
    pendingPlayer.value = player;
    infoMessage.value = `Click a position slot to place ${player.name || player.real_name}`;
    error.value = '';
};

const handleSlotClick = (pos, index) => {
    if (pendingPlayer.value) {
        const formation = FORMATIONS[selectedFormation.value];
        let slotType = 'GK';
        if (pos === 'GK') slotType = 'GK';
        else if (pos === 'BENCH') slotType = 'SUB';
        else if (formation[pos]) slotType = formation[pos][index];
        else slotType = pos;
        
        if (pos !== 'BENCH' && !isCompatible(pendingPlayer.value.position, slotType)) {
            console.log(`Warning: Placing ${pendingPlayer.value.position} in ${slotType} slot. Disadvantage applied.`);
        }

        squad.value[pos][index] = pendingPlayer.value;
        pendingPlayer.value = null;
        infoMessage.value = '';
        error.value = ''; 
    } else {
        if (squad.value[pos][index]) {
            openDetail(squad.value[pos][index]);
        }
    }
};

const removePlayer = (pos, index) => {
    const p = squad.value[pos][index];
    if (p && p.id === captainId.value) {
        captainId.value = null;
    }
    squad.value[pos][index] = null;
};

const toggleCaptain = (player) => {
    if (!player) return;
    if (captainId.value === player.id) {
        captainId.value = null;
    } else {
        captainId.value = player.id;
    }
};

const saveTeam = async () => {
    if (!isValidTeam.value) return;
    
    loading.value = true;
    error.value = '';
    
    try {
        // Map nulls to null in the array to preserve slot positions (sparse team)
        const cardIds = Object.values(squad.value).flat().map(p => p ? p.id : null);
        
        const url = isEditing.value ? `/api/teams/${editingTeamId.value}` : '/api/teams';
        const method = isEditing.value ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify({
                name: teamName.value,
                cardIds: cardIds,
                formation: selectedFormation.value,
                captainId: captainId.value,
                kitNumbers: kitNumbers.value
            })
        });
        
        if (!res.ok) throw new Error('Failed to save team');
        
        router.push('/my-teams');
    } catch (err) {
        console.error(err);
        error.value = err.message;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCollection();
});

const kitNumbers = ref({}); 
const editingKitPlayer = ref(null);
const pendingKitNumber = ref('');

const openKitEditor = async (player) => {
    if (!player) return;
    editingKitPlayer.value = player;
    const id = String(player.id || player.cardId);
    let currentNum = kitNumbers.value[id];
    pendingKitNumber.value = (currentNum && currentNum !== 0) ? String(currentNum) : '';
    await nextTick();
    if (kitInput.value) {
        kitInput.value.focus();
        kitInput.value.select();
    }
};

const saveKitNumber = () => {
    if (editingKitPlayer.value) {
        let num = parseInt(pendingKitNumber.value);
        if (isNaN(num) || num < 0 || num > 99) num = 0; 
        const id = String(editingKitPlayer.value.id || editingKitPlayer.value.cardId);
        if (num > 0) {
            kitNumbers.value = { ...kitNumbers.value, [id]: num };
        } else {
            const newNums = { ...kitNumbers.value };
            delete newNums[id];
            kitNumbers.value = newNums;
        }
    }
    closeKitEditor();
};

const closeKitEditor = () => {
    editingKitPlayer.value = null;
    pendingKitNumber.value = '';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1a1b26; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #414868; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #565f89; 
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
}
</style>
