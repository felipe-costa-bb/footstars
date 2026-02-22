import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import PlayerCardSlot from '../components/builder/PlayerCardSlot.vue'; 
import PlayerDetailView from '../components/PlayerDetailView.vue';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const teamName = ref('My Squad');
const loading = ref(false);
const error = ref('');
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
    // Formations with separate DM and AM rows
    '4-2-3-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CDM', 'CDM'],           // Defensive Midfielders (bottom row)
        AM: ['LM', 'CAM', 'RM'],      // Attacking Midfielders (top row)
        FW: ['ST'] 
    },
    '4-1-4-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CDM'],                  // Single holding midfielder
        AM: ['LM', 'CM', 'CM', 'RM'], // 4 midfielders above
        FW: ['ST'] 
    },
    '4-3-2-1': { 
        DF: ['LB', 'CB', 'CB', 'RB'], 
        MF: ['CM', 'CM', 'CM'],       // 3 central midfielders
        AM: ['CAM', 'CAM'],           // 2 attacking midfielders/second strikers
        FW: ['ST'] 
    },
    '3-1-4-2': { 
        DF: ['CB', 'CB', 'CB'], 
        MF: ['CDM'],                  // Single holding midfielder
        AM: ['LM', 'CM', 'CM', 'RM'], // 4 midfielders
        FW: ['ST', 'ST'] 
    }
};

const selectedFormation = ref('4-4-2');

// Squad State: Dynamic based on formation
const squad = ref({
    GK: [null],
    DF: [null, null, null, null],
    MF: [null, null, null, null],
    AM: [],  // Attacking midfielders (for formations like 4-2-3-1)
    FW: [null, null],
    BENCH: Array(9).fill(null)
});

// Check if current formation has a separate DM/AM row
const hasDMRow = computed(() => {
    return !!FORMATIONS[selectedFormation.value]?.AM;
});

// Helper to determine slot counts based on current formation
const getSlots = (pos) => {
    if (pos === 'GK') return ['GK'];
    const formation = FORMATIONS[selectedFormation.value];
    if (!formation) return [];
    const slots = formation[pos];
    return slots || [];
};

// COMPATIBILITY LOGIC
const isCompatible = (playerPos, slotPos) => {
    if (!playerPos || !slotPos) return false;
    if (playerPos === slotPos) return true;
    
    // Strict Groups
    const compatibility = {
        'GK': [],
        'LB': ['LWB', 'DF'],
        'LWB': ['LB', 'DF'],
        'RB': ['RWB', 'DF'],
        'RWB': ['RB', 'DF'],
        'CB': ['DF'], // Allow generic DF to play CB
        'CDM': ['CM', 'MF'],
        'CM': ['CDM', 'CAM', 'MF'],
        'CAM': ['CM', 'CF', 'MF'],
        'LM': ['LW', 'MF'],
        'RM': ['RW', 'MF'],
        'LW': ['LM', 'FW'], // Strict: No ST
        'RW': ['RM', 'FW'], // Strict: No ST
        'ST': ['CF', 'FW'], // Strict: No LW/RW (unless they have alternate position, but base rules are strict)
        'CF': ['ST', 'CAM', 'FW']
    };

    return compatibility[slotPos]?.includes(playerPos) || false;
};

// getSlots helper needs to handle BENCH? 
// No, BENCH is static 9 slots, can just iterate number or array.

// Change formation and redistribute players
const changeFormation = (newFormation) => {
    if (!FORMATIONS[newFormation]) return;

    const oldSquad = { ...squad.value };
    selectedFormation.value = newFormation;
    
    const formation = FORMATIONS[newFormation];
    
    // Initialize new squad structure with correct length arrays
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

    // Redistribution logic: Try to auto-place
    const allOldPlayers = [
        ...oldSquad.DF, ...oldSquad.MF, ...(oldSquad.AM || []), ...oldSquad.FW
    ].filter(p => p !== null);
    
    // Clear them from new squad for clean redistribution
    // (GK is already kept)

    allOldPlayers.forEach(player => {
        // Find a compatible slot in new squad
        // Check all position types including AM
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

const availablePlayers = computed(() => {
    return allCards.value
        .filter(c => {
            const pid = c.playerId || c.player_id;
            return !occupiedCardIds.value.has(c.id) && !occupiedPlayerIds.value.has(pid);
        })
        .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
});

const isValidTeam = computed(() => {
    // Count only starters (GK, DF, MF, AM, FW)
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
                // Normalize keys to strings to ensure consistency
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
            
            // Init empty
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
            
            const playersToPlace = cardIdsToPlace.map(c => {
                const id = typeof c === 'object' ? c.id : c;
                return allCards.value.find(p => p.id === id);
            }).filter(p => p);

            // Simple placement strategy for load: try to fit
            playersToPlace.forEach(player => {
                selectPlayer(player, true); 
            });
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
        error.value = '';
        return;
    }

    // Try to auto-place in compatible slot
    // Check all generic lines including AM
    const formation = FORMATIONS[selectedFormation.value];
    const generics = formation.AM ? ['GK', 'DF', 'MF', 'AM', 'FW'] : ['GK', 'DF', 'MF', 'FW'];
    let placed = false;
    
    // Prioritize natural line
    const naturalLine = getGenericPosition(player.position);
    // Put strictly matching line first in check list?
    // Actually just check natural line slots first
    
    const tryPlaceInLine = (line) => {
        const slots = squad.value[line];
        if (!slots || slots.length === 0) return false;
        const slotTypes = (line === 'GK') ? ['GK'] : formation[line];
        if (!slotTypes) return false;
        
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] === null && isCompatible(player.position, slotTypes[i])) {
                squad.value[line][i] = player;
                return true; 
            }
        }
        return false;
    };
    
    if (tryPlaceInLine(naturalLine)) {
        pendingPlayer.value = null;
        error.value = '';
        return;
    }
    
    // If not natural line, try others? (Versatile players?)
    // For now strictness usually implies natural line too, but isCompatible handles cross-line.
    // e.g. CDM (MF) playing CB (DF)?
    // If isCompatible('CDM', 'CB') is true, we should allow it.
    // My map only has 'CM' <-> 'CDM'.
    
    // Manual placement (set this first, so if bench fails, we fall back to manual)
    pendingPlayer.value = player;
    error.value = `Select a ${player.position} compatible slot ('${naturalLine}' area) or Bench`;

    // Last resort: Try auto-bench if everything else failed
    // Ensure we don't duplicate if already in pending (logic below handles placement)
    const benchSlots = squad.value.BENCH;
    for (let i = 0; i < benchSlots.length; i++) {
        if (benchSlots[i] === null) {
            squad.value.BENCH[i] = player;
            pendingPlayer.value = null; // Clear pending since we placed it
            error.value = '';
            return;
        }
    }
};

const handleSlotClick = (pos, index) => {
    if (pendingPlayer.value) {
        // Validate compatibility (Visual only now)
        const formation = FORMATIONS[selectedFormation.value];
        let slotType = 'GK';
        if (pos === 'GK') slotType = 'GK';
        else if (pos === 'BENCH') slotType = 'SUB';
        else if (formation[pos]) slotType = formation[pos][index];
        else slotType = pos; // Fallback
        
        if (pos !== 'BENCH' && !isCompatible(pendingPlayer.value.position, slotType)) {
            // Warn but allow
            console.log(`Warning: Placing ${pendingPlayer.value.position} in ${slotType} slot. Disadvantage applied.`);
        }

        squad.value[pos][index] = pendingPlayer.value;
        pendingPlayer.value = null;
        error.value = ''; // Clear error
    } else {
        if (squad.value[pos][index]) {
            removePlayer(pos, index);
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
        // Toggle off
        captainId.value = null;
    } else {
        // Set new captain
        captainId.value = player.id;
    }
};

const saveTeam = async () => {
    if (!isValidTeam.value) return;
    
    loading.value = true;
    error.value = '';
    
    try {
        const cardIds = Object.values(squad.value).flat().filter(p => p).map(p => p.id);
        
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

// Kit Number Logic
const kitNumbers = ref({}); 
const editingKitPlayer = ref(null);
const pendingKitNumber = ref('');

const openKitEditor = async (player) => {
    if (!player) return;
    editingKitPlayer.value = player;
    
    // Ensure consistent ID usage (always string)
    const id = String(player.id || player.cardId);
    
    // Get current value if exists (try direct access)
    // We try to grab from kitNumbers using string key
    let currentNum = kitNumbers.value[id];
    
    console.log('[DEBUG] Opening Kit Editor', { 
        playerId: id, 
        currentNum, 
        keys: Object.keys(kitNumbers.value)
    });
    
    // Set pending number (convert to string for input)
    pendingKitNumber.value = (currentNum && currentNum !== 0) ? String(currentNum) : '';

    // Focus input
    await nextTick();
    if (kitInput.value) {
        kitInput.value.focus();
        kitInput.value.select();
    }
};

const saveKitNumber = () => {
    if (editingKitPlayer.value) {
        let num = parseInt(pendingKitNumber.value);
        if (isNaN(num) || num < 0 || num > 99) num = 0; // 0 = none
        
        const id = String(editingKitPlayer.value.id || editingKitPlayer.value.cardId);

        if (num > 0) {
            // Use spread assignment to ensure reactivity if needed, though simple assignment should work with ref value
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
