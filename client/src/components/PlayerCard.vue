<template>
  <div class="relative w-full h-full group font-display" :class="{ 'cursor-pointer': !noHover }">
    <!-- Card Container with Shield Shape via clip-path -->
    <div 
      class="relative w-full h-full transition-all duration-300"
      :class="{ 'group-hover:scale-105 group-hover:-translate-y-1': !noHover }"
    >
      <!-- Shield Background -->
      <div 
        class="absolute inset-0 shield-shape overflow-hidden"
        :class="cardBackgroundClass"
      >
        <!-- Inner gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/40"></div>
        
        <!-- Decorative pattern lines -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-6 left-3 right-3 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <div class="absolute bottom-[45%] left-3 right-3 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>

        <!-- RARE STRIPES EFFECT - diagonal lines in top-right corner like FIFA -->
        <div v-if="isRare" class="rare-stripes absolute top-0 right-0 w-20 h-28 pointer-events-none overflow-hidden">
          <div class="absolute inset-0 rare-stripe-pattern"></div>
        </div>

        <!-- Shine effect -->
        <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>

      <!-- Content Container -->
      <div class="relative w-full h-full shield-shape flex flex-col">
        
        <!-- Top Section: Rating/Position left, Badges right -->
        <div class="flex justify-between px-2 pt-2 z-20">
          <!-- Left: Rating & Position -->
          <div class="flex flex-col">
            <!-- Rating -->
            <span class="text-2xl sm:text-3xl font-black leading-none text-white drop-shadow-lg">{{ rating }}</span>
            <!-- Position -->
            <span class="text-xs sm:text-sm font-bold text-white/90 tracking-wider drop-shadow mt-0.5">{{ position }}</span>
          </div>
          
          <!-- Right: Nationality Flag, Club Badge, League Badge -->
          <div class="flex flex-col items-end gap-1">
            <!-- Nationality Flag (actual flag image) -->
            <div v-if="nationality" class="w-6 h-4 rounded-sm overflow-hidden shadow border border-white/30" :title="nationality">
              <img 
                :src="flagUrl" 
                :alt="nationality"
                class="w-full h-full object-cover"
                @error="$event.target.style.display='none'"
              />
            </div>
            
            <!-- Club Badge (actual logo) -->
            <div v-if="club" class="w-7 h-7 rounded bg-white flex items-center justify-center shadow border border-white/30 overflow-hidden p-0.5" :title="club">
              <img 
                v-if="clubLogoUrl"
                :src="clubLogoUrl" 
                :alt="club"
                class="w-full h-full object-contain"
                @error="handleClubImgError"
              />
              <span v-else class="text-[7px] font-black text-gray-800 leading-none text-center">{{ clubInitials }}</span>
            </div>

            <!-- League Badge -->
            <div v-if="league" class="w-6 h-6 rounded overflow-hidden shadow border border-white/30" :title="league">
              <img 
                :src="leagueLogoUrl" 
                :alt="league"
                class="w-full h-full object-contain bg-white/90 p-0.5"
                @error="handleLeagueImgError"
              />
            </div>
          </div>
        </div>

        <!-- Player Image Section -->
        <div class="flex-1 relative flex items-end justify-center overflow-hidden -mt-4 z-10">
          <canvas 
            ref="processCanvas" 
            class="hidden"
          ></canvas>
          <img 
            v-if="imageUrl" 
            ref="playerImg"
            :src="processedImageUrl || imageUrl" 
            alt="Player" 
            class="h-[95%] w-auto object-contain drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-105 origin-bottom filter brightness-105 contrast-105"
            @load="processImageTransparency"
            @error="handleImgError"
          />
          <img 
            v-else 
            src="/assets/silhouette.svg"
            alt="Player" 
            class="h-[95%] w-auto object-contain drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-105 origin-bottom filter brightness-105 contrast-110"
          />
        </div>

        <!-- Bottom Section: Name -->
        <div class="relative z-20 px-1 pb-2 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
          <!-- Player Name -->
          <div class="text-center border-t border-white/20 pt-1">
            <h3 class="text-[11px] sm:text-sm font-black text-white uppercase tracking-tight truncate leading-tight drop-shadow">
              {{ displayName }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Card Border Effect -->
      <div class="absolute inset-0 shield-shape border-2 pointer-events-none" :class="borderClass"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: String,
  rating: Number,
  position: String,
  imageUrl: String,
  team: String,        // Club name
  club: String,        // Alias for team
  nationality: String,
  league: String,
  stats: Object,
  rarity: String,
  noHover: Boolean
});

// For programmatic transparency of AI images with white backgrounds
import { ref } from 'vue';
const playerImg = ref(null);
const processCanvas = ref(null);
const processedImageUrl = ref('');
const isProcessing = ref(false);

const processImageTransparency = () => {
  // Only process if it's likely an AI generated image with white background
  // and we haven't processed it yet
  if (!props.imageUrl || !props.imageUrl.includes('_face') || processedImageUrl.value || isProcessing.value) return;

  isProcessing.value = true;
  const img = playerImg.value;
  const canvas = processCanvas.value;
  if (!img || !canvas) return;

  try {
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Remove white background (anything near white)
    // Using a threshold to catch anti-aliased edges
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is very bright white/off-white
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // Alpha
      }
    }

    ctx.putImageData(imageData, 0, 0);
    processedImageUrl.value = canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to process image transparency:', err);
  } finally {
    isProcessing.value = false;
  }
};

const handleImgError = (event) => {
  if (processedImageUrl.value) {
    processedImageUrl.value = ''; // Revert to original if processed fails
  } else {
    event.target.src = '/assets/silhouette.svg';
  }
};

// Country name to ISO code mapping for flags
const COUNTRY_CODES = {
  // Major football nations
  'Argentina': 'ar', 'Brazil': 'br', 'England': 'gb-eng', 'France': 'fr', 'Germany': 'de',
  'Spain': 'es', 'Italy': 'it', 'Portugal': 'pt', 'Netherlands': 'nl', 'Holland': 'nl', 'Belgium': 'be',
  'Croatia': 'hr', 'Uruguay': 'uy', 'Colombia': 'co', 'Poland': 'pl', 'Egypt': 'eg',
  'Senegal': 'sn', 'Norway': 'no', 'Sweden': 'se', 'Denmark': 'dk', 'Austria': 'at',
  'Switzerland': 'ch', 'Wales': 'gb-wls', 'Scotland': 'gb-sct', 'Northern Ireland': 'gb-nir',
  'Republic of Ireland': 'ie', 'Ireland': 'ie',
  'USA': 'us', 'United States': 'us', 'Mexico': 'mx', 'Canada': 'ca', 'Japan': 'jp',
  'South Korea': 'kr', 'Korea Republic': 'kr', 'Australia': 'au', 'Morocco': 'ma',
  'Nigeria': 'ng', 'Ghana': 'gh', 'Cameroon': 'cm', 'Ivory Coast': 'ci', 'Algeria': 'dz',
  'Tunisia': 'tn', 'Serbia': 'rs', 'Ukraine': 'ua', 'Czech Republic': 'cz', 'Czechia': 'cz',
  'Slovakia': 'sk', 'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg', 'Greece': 'gr',
  'Turkey': 'tr', 'Russia': 'ru', 'Chile': 'cl', 'Peru': 'pe', 'Ecuador': 'ec',
  'Venezuela': 've', 'Paraguay': 'py', 'Bolivia': 'bo', 'Jamaica': 'jm', 'Costa Rica': 'cr',
  'China': 'cn', 'China PR': 'cn', 'Chinese Taipei': 'tw',
  'Côte d\'Ivoire': 'ci', 'Congo DR': 'cd', 'Congo': 'cg',
  'Cape Verde': 'cv', 'Cape Verde Islands': 'cv',
  // European nations
  'Albania': 'al', 'Andorra': 'ad', 'Armenia': 'am', 'Azerbaijan': 'az', 'Belarus': 'by',
  'Bosnia and Herzegovina': 'ba', 'Cyprus': 'cy', 'Estonia': 'ee', 'Finland': 'fi',
  'Georgia': 'ge', 'Iceland': 'is', 'Kosovo': 'xk', 'Latvia': 'lv', 'Liechtenstein': 'li',
  'Lithuania': 'lt', 'Luxembourg': 'lu', 'Malta': 'mt', 'Moldova': 'md', 'Montenegro': 'me',
  'North Macedonia': 'mk', 'Slovenia': 'si',
  // African nations
  'Angola': 'ao', 'Antigua and Barbuda': 'ag', 'Benin': 'bj', 'Burkina Faso': 'bf',
  'Burundi': 'bi', 'Central African Republic': 'cf', 'Chad': 'td', 'Comoros': 'km',
  'Equatorial Guinea': 'gq', 'Faroe Islands': 'fo', 'Gabon': 'ga', 'Gambia': 'gm',
  'Gibraltar': 'gi', 'Grenada': 'gd', 'Guinea': 'gn', 'Guinea-Bissau': 'gw',
  'Kenya': 'ke', 'Liberia': 'lr', 'Libya': 'ly', 'Madagascar': 'mg', 'Malawi': 'mw',
  'Mali': 'ml', 'Mauritania': 'mr', 'Mozambique': 'mz', 'Namibia': 'na', 'Niger': 'ne',
  'Rwanda': 'rw', 'Sierra Leone': 'sl', 'Somalia': 'so', 'South Africa': 'za',
  'Tanzania': 'tz', 'Togo': 'tg', 'Uganda': 'ug', 'Zambia': 'zm', 'Zimbabwe': 'zw',
  // Americas
  'Barbados': 'bb', 'Bermuda': 'bm', 'Cuba': 'cu', 'Curaçao': 'cw', 'Dominican Republic': 'do',
  'El Salvador': 'sv', 'Guatemala': 'gt', 'Guyana': 'gy', 'Haiti': 'ht', 'Honduras': 'hn',
  'Montserrat': 'ms', 'Panama': 'pa', 'Puerto Rico': 'pr', 'St. Kitts and Nevis': 'kn',
  'St. Lucia': 'lc', 'Suriname': 'sr', 'Trinidad and Tobago': 'tt',
  // Asia & Middle East
  'Afghanistan': 'af', 'Bangladesh': 'bd', 'Hong Kong': 'hk', 'India': 'in', 'Indonesia': 'id',
  'Iran': 'ir', 'Iraq': 'iq', 'Israel': 'il', 'Jordan': 'jo', 'Lebanon': 'lb',
  'Malaysia': 'my', 'Pakistan': 'pk', 'Palestine': 'ps', 'Philippines': 'ph',
  'Saudi Arabia': 'sa', 'Sri Lanka': 'lk', 'Syria': 'sy', 'Tajikistan': 'tj',
  'Thailand': 'th', 'United Arab Emirates': 'ae', 'Uzbekistan': 'uz', 'Vanuatu': 'vu',
  // Oceania
  'New Zealand': 'nz',
  'Unknown': ''
};

// League logo URLs - comprehensive list
const LEAGUE_LOGOS = {
  // Top 5 Leagues
  'Premier League': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/280px-Premier_League_Logo.svg.png',
  'La Liga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/LaLiga_EA_Sports_2023_Vertical_Logo.svg/200px-LaLiga_EA_Sports_2023_Vertical_Logo.svg.png',
  'Bundesliga': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/200px-Bundesliga_logo_%282017%29.svg.png',
  'Serie A': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2022.svg/200px-Serie_A_logo_2022.svg.png',
  'Ligue 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ligue1.svg/200px-Ligue1.svg.png',
  // Other European Leagues
  'Eredivisie': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Eredivisie_nieuw_logo_2017-.svg/200px-Eredivisie_nieuw_logo_2017-.svg.png',
  'Primeira Liga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Liga_Portugal_logo.svg/200px-Liga_Portugal_logo.svg.png',
  'Liga Portugal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Liga_Portugal_logo.svg/200px-Liga_Portugal_logo.svg.png',
  'Scottish Premiership': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/Scottish_Premiership.svg/200px-Scottish_Premiership.svg.png',
  'Belgian Pro League': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Belgian_First_Division_A_logo.svg/200px-Belgian_First_Division_A_logo.svg.png',
  'Jupiler Pro League': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Belgian_First_Division_A_logo.svg/200px-Belgian_First_Division_A_logo.svg.png',
  'Super Lig': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/11/S%C3%BCper_Lig_logo.svg/200px-S%C3%BCper_Lig_logo.svg.png',
  'Süper Lig': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/11/S%C3%BCper_Lig_logo.svg/200px-S%C3%BCper_Lig_logo.svg.png',
  'Russian Premier League': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Russian_Premier_League_Logo.svg/200px-Russian_Premier_League_Logo.svg.png',
  'Ukrainian Premier League': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/82/Ukrainian_Premier_League_logo.svg/200px-Ukrainian_Premier_League_logo.svg.png',
  'Greek Super League': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Super_League_Greece_logo.svg/200px-Super_League_Greece_logo.svg.png',
  'Swiss Super League': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Swiss_Super_League_logo.svg/200px-Swiss_Super_League_logo.svg.png',
  'Austrian Bundesliga': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Austrian_Football_Bundesliga_logo.svg/200px-Austrian_Football_Bundesliga_logo.svg.png',
  'Czech First League': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Czech_First_League_logo.svg/200px-Czech_First_League_logo.svg.png',
  'Croatian First Football League': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Prva_HNL_Logo.svg/200px-Prva_HNL_Logo.svg.png',
  'Croatian First League': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Prva_HNL_Logo.svg/200px-Prva_HNL_Logo.svg.png',
  // Scandinavian Leagues
  'Danish Superliga': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Danish_Superliga_logo.svg/200px-Danish_Superliga_logo.svg.png',
  'Superliga': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Danish_Superliga_logo.svg/200px-Danish_Superliga_logo.svg.png',
  'Allsvenskan': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/Allsvenskan_logo.svg/200px-Allsvenskan_logo.svg.png',
  'Eliteserien': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Eliteserien_logo.svg/200px-Eliteserien_logo.svg.png',
  'Veikkausliiga': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/54/Veikkausliiga_logo.svg/200px-Veikkausliiga_logo.svg.png',
  // Eastern Europe
  'Ekstraklasa': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Ekstraklasa_2022.svg/200px-Ekstraklasa_2022.svg.png',
  'Liga I': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Liga_1_Romania_logo.svg/200px-Liga_1_Romania_logo.svg.png',
  'NB I': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/OTP_Bank_Liga_logo.svg/200px-OTP_Bank_Liga_logo.svg.png',
  'Azerbaijan Premier': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Azerbaijan_Premier_League_logo.svg/200px-Azerbaijan_Premier_League_logo.svg.png',
  // Americas
  'MLS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/MLS_crest_logo_RGB_gradient.svg/200px-MLS_crest_logo_RGB_gradient.svg.png',
  'Major League Soccer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/MLS_crest_logo_RGB_gradient.svg/200px-MLS_crest_logo_RGB_gradient.svg.png',
  'Liga MX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Liga_MX_Logo.svg/200px-Liga_MX_Logo.svg.png',
  'Argentine Primera División': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Liga_Profesional_de_F%C3%BAtbol_logo.svg/200px-Liga_Profesional_de_F%C3%BAtbol_logo.svg.png',
  'Argentine Primera': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Liga_Profesional_de_F%C3%BAtbol_logo.svg/200px-Liga_Profesional_de_F%C3%BAtbol_logo.svg.png',
  'Brasileirão': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg/200px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.svg.png',
  // Asia & Middle East
  'Saudi Pro League': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Saudi_Pro_League.svg/200px-Saudi_Pro_League.svg.png',
  'J1 League': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/35/J1_League_logo.svg/200px-J1_League_logo.svg.png',
  'K League 1': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/K_League_1_logo.svg/200px-K_League_1_logo.svg.png',
  'Chinese Super League': 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Chinese_Super_League_logo.svg/200px-Chinese_Super_League_logo.svg.png',
  'A-League': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/A-League_Men_logo.svg/200px-A-League_Men_logo.svg.png',
  'Indian Super League': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Indian_Super_League_logo.svg/200px-Indian_Super_League_logo.svg.png',
  // Women's Leagues
  'NWSL': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/National_Women%27s_Soccer_League_logo.svg/200px-National_Women%27s_Soccer_League_logo.svg.png',
  'WSL': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/FA_Women%27s_Super_League_logo.svg/200px-FA_Women%27s_Super_League_logo.svg.png',
  "Women's Super League": 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/FA_Women%27s_Super_League_logo.svg/200px-FA_Women%27s_Super_League_logo.svg.png',
  'Division 1 Féminine': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Division_1_F%C3%A9minine_logo.svg/200px-Division_1_F%C3%A9minine_logo.svg.png',
  'Liga F': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Liga_F_logo.svg/200px-Liga_F_logo.svg.png',
  'Frauen-Bundesliga': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Frauen-Bundesliga_logo.svg/200px-Frauen-Bundesliga_logo.svg.png',
  'Serie A Femminile': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Serie_A_Femminile_logo.svg/200px-Serie_A_Femminile_logo.svg.png',
  'A-League Women': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/51/A-League_Women_logo.svg/200px-A-League_Women_logo.svg.png',
  'Damallsvenskan': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Damallsvenskan_logo.svg/200px-Damallsvenskan_logo.svg.png',
  'Toppserien': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/Toppserien_logo.svg/200px-Toppserien_logo.svg.png',
  // English Lower Leagues
  'EFL Championship': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/EFL_Championship.svg/200px-EFL_Championship.svg.png',
  'Championship': 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b5/EFL_Championship.svg/200px-EFL_Championship.svg.png',
  'EFL League One': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/EFL_League_One.svg/200px-EFL_League_One.svg.png',
  'League One': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/EFL_League_One.svg/200px-EFL_League_One.svg.png',
  'EFL League Two': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/38/EFL_League_Two.svg/200px-EFL_League_Two.svg.png',
  'League Two': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/38/EFL_League_Two.svg/200px-EFL_League_Two.svg.png',
  // German Lower Leagues
  '2. Bundesliga': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/2._Bundesliga_logo.svg/200px-2._Bundesliga_logo.svg.png',
  '3. Liga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3._Liga_logo.svg/200px-3._Liga_logo.svg.png',
  // Spanish Lower Leagues  
  'La Liga 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga_Hypermotion_2023_Vertical_Logo.svg/200px-LaLiga_Hypermotion_2023_Vertical_Logo.svg.png',
  'Segunda División': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/LaLiga_Hypermotion_2023_Vertical_Logo.svg/200px-LaLiga_Hypermotion_2023_Vertical_Logo.svg.png',
  // Italian Lower Leagues
  'Serie B': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Serie_B_Logo_2022.svg/200px-Serie_B_Logo_2022.svg.png',
  // French Lower Leagues
  'Ligue 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Ligue_2_BKT_logo.svg/200px-Ligue_2_BKT_logo.svg.png',
  // Irish
  'League of Ireland': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/68/League_of_Ireland_Premier_Division_logo.svg/200px-League_of_Ireland_Premier_Division_logo.svg.png',
  // Cypriot
  'Cypriot First Division': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Cypriot_First_Division_logo.svg/200px-Cypriot_First_Division_logo.svg.png'
};

// Club badge/logo URLs - comprehensive list
const CLUB_LOGOS = {
  // Premier League
  'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
  'Aston Villa': 'https://upload.wikimedia.org/wikipedia/en/9/9a/Aston_Villa_FC_crest_%282016%29.svg',
  'AFC Bournemouth': 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg',
  'Bournemouth': 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg',
  'Brentford': 'https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg',
  'Brighton': 'https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg',
  'Burnley': 'https://upload.wikimedia.org/wikipedia/en/6/62/Burnley_FC_Logo.svg',
  'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
  'Crystal Palace': 'https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg',
  'Everton': 'https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg',
  'Fulham': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg',
  'Ipswich': 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg',
  'Leicester City': 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg',
  'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
  'Luton Town': 'https://upload.wikimedia.org/wikipedia/en/9/9d/Luton_Town_logo.svg',
  'Man City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
  'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
  'Man Utd': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  'Man United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  'Manchester Utd': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  'Newcastle Utd': 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
  'Newcastle': 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
  "Nott'm Forest": 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg',
  'Nottm Forest': 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg',
  'Sheffield Utd': 'https://upload.wikimedia.org/wikipedia/en/9/9c/Sheffield_United_FC_logo.svg',
  'Southampton': 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg',
  'Spurs': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
  'Tottenham Hotspur': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
  'Tottenham': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
  'West Ham': 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
  'Wolves': 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
  // Championship & EFL
  'Birmingham City': 'https://upload.wikimedia.org/wikipedia/en/6/68/Birmingham_City_FC_logo.svg',
  'Blackburn Rovers': 'https://upload.wikimedia.org/wikipedia/en/0/0f/Blackburn_Rovers.svg',
  'Bristol City': 'https://upload.wikimedia.org/wikipedia/en/f/f5/Bristol_City_crest.svg',
  'Cardiff City': 'https://upload.wikimedia.org/wikipedia/en/3/3c/Cardiff_City_crest.svg',
  'Coventry City': 'https://upload.wikimedia.org/wikipedia/en/9/94/Coventry_City_FC_logo.svg',
  'Derby County': 'https://upload.wikimedia.org/wikipedia/en/4/4a/Derby_County_crest.svg',
  'Huddersfield': 'https://upload.wikimedia.org/wikipedia/en/5/5a/Huddersfield_Town_A.F.C._logo.svg',
  'Hull City': 'https://upload.wikimedia.org/wikipedia/en/5/54/Hull_City_A.F.C._logo.svg',
  'Leeds United': 'https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg',
  'Middlesbrough': 'https://upload.wikimedia.org/wikipedia/en/2/2c/Middlesbrough_FC_crest.svg',
  'Millwall': 'https://upload.wikimedia.org/wikipedia/en/7/74/Millwall_FC_logo.svg',
  'Norwich': 'https://upload.wikimedia.org/wikipedia/en/8/8c/Norwich_City.svg',
  'Plymouth Argyle': 'https://upload.wikimedia.org/wikipedia/en/a/a8/Plymouth_Argyle_F.C._logo.svg',
  'Portsmouth': 'https://upload.wikimedia.org/wikipedia/en/3/38/Portsmouth_FC_logo.svg',
  'Preston': 'https://upload.wikimedia.org/wikipedia/en/8/82/Preston_North_End_FC.svg',
  'QPR': 'https://upload.wikimedia.org/wikipedia/en/3/31/Queens_Park_Rangers_crest.svg',
  'Sheffield Wed': 'https://upload.wikimedia.org/wikipedia/en/8/88/Sheffield_Wednesday_badge.svg',
  'Stoke City': 'https://upload.wikimedia.org/wikipedia/en/2/29/Stoke_City_FC.svg',
  'Sunderland': 'https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg',
  'Swansea City': 'https://upload.wikimedia.org/wikipedia/en/a/a3/Swansea_City_AFC_logo.svg',
  'Watford': 'https://upload.wikimedia.org/wikipedia/en/e/e2/Watford.svg',
  'West Brom': 'https://upload.wikimedia.org/wikipedia/en/8/8b/West_Bromwich_Albion.svg',
  'Wigan Athletic': 'https://upload.wikimedia.org/wikipedia/en/4/43/Wigan_Athletic.svg',
  'Wrexham': 'https://upload.wikimedia.org/wikipedia/en/c/c1/Wrexham_AFC.svg',
  // La Liga
  'Atl\u00e9tico de Madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
  'Atlético Madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
  'Atletico Madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
  'Athletic Club': 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg',
  'FC Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
  'Celta': 'https://upload.wikimedia.org/wikipedia/en/1/12/RC_Celta_de_Vigo_logo.svg',
  'Getafe CF': 'https://upload.wikimedia.org/wikipedia/en/4/46/Getafe_logo.svg',
  'Girona FC': 'https://upload.wikimedia.org/wikipedia/en/9/90/For_article_Girona_FC.svg',
  'CA Osasuna': 'https://upload.wikimedia.org/wikipedia/en/d/db/Osasuna_logo.svg',
  'Rayo Vallecano': 'https://upload.wikimedia.org/wikipedia/en/1/12/Rayo_Vallecano_logo.svg',
  'RCD Mallorca': 'https://upload.wikimedia.org/wikipedia/en/e/e0/Rcd_mallorca.svg',
  'Real Betis': 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_betis_logo.svg',
  'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  'Real Sociedad': 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
  'Sevilla FC': 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
  'Sevilla': 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
  'Valencia CF': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
  'Valencia': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
  'Villarreal CF': 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo.svg',
  'Villarreal': 'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo.svg',
  'UD Las Palmas': 'https://upload.wikimedia.org/wikipedia/en/5/5e/UD_Las_Palmas_logo.svg',
  'D. Alavés': 'https://upload.wikimedia.org/wikipedia/en/3/3b/Deportivo_Alav%C3%A9s_logo_%282020%29.svg',
  'CD Leganés': 'https://upload.wikimedia.org/wikipedia/en/3/37/CD_Legan%C3%A9s_logo.svg',
  'RCD Espanyol': 'https://upload.wikimedia.org/wikipedia/en/d/d8/RCD_Espanyol_logo.svg',
  // Bundesliga
  'FC Bayern München': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
  'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
  'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
  'Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
  'RB Leipzig': 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
  'Leverkusen': 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
  'Bayer Leverkusen': 'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
  'VfB Stuttgart': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg',
  'Frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
  "M'gladbach": 'https://upload.wikimedia.org/wikipedia/commons/8/81/Borussia_M%C3%B6nchengladbach_logo.svg',
  'VfL Wolfsburg': 'https://upload.wikimedia.org/wikipedia/commons/c/ce/VfL_Wolfsburg_Logo.svg',
  'FC Augsburg': 'https://upload.wikimedia.org/wikipedia/en/c/c5/FC_Augsburg_logo.svg',
  'SC Freiburg': 'https://upload.wikimedia.org/wikipedia/en/6/6d/SC_Freiburg_logo.svg',
  'TSG Hoffenheim': 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Logo_TSG_Hoffenheim.svg',
  'Union Berlin': 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg',
  'VfL Bochum 1848': 'https://upload.wikimedia.org/wikipedia/commons/7/72/VfL_Bochum_logo.svg',
  'SV Werder Bremen': 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg',
  'FC Schalke 04': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/FC_Schalke_04_Logo.svg',
  'Holstein Kiel': 'https://upload.wikimedia.org/wikipedia/en/5/57/Holstein_Kiel_Logo.svg',
  'FC St. Pauli': 'https://upload.wikimedia.org/wikipedia/en/8/8d/FC_St._Pauli_logo.svg',
  'Heidenheim': 'https://upload.wikimedia.org/wikipedia/en/7/76/1._FC_Heidenheim_1846_logo.svg',
  'Mainz': 'https://upload.wikimedia.org/wikipedia/en/9/9e/1._FSV_Mainz_05_logo.svg',
  '1. FSV Mainz 05': 'https://upload.wikimedia.org/wikipedia/en/9/9e/1._FSV_Mainz_05_logo.svg',
  // Serie A
  'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Juventus_FC_-_pictogram.svg',
  'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
  'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
  'Inter': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
  'AS Roma': 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
  'Roma': 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
  'SSC Napoli': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg',
  'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg',
  'Lazio': 'https://upload.wikimedia.org/wikipedia/en/c/ce/S.S._Lazio_badge.svg',
  'Fiorentina': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/ACF_Fiorentina_-_logo_%28Italy%2C_2022%29.svg',
  'Atalanta': 'https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg',
  'Bologna': 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Bologna_F.C._1909_logo.svg',
  'Torino': 'https://upload.wikimedia.org/wikipedia/en/2/2e/Torino_FC_Logo.svg',
  'Udinese': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Udinese_Calcio_logo.svg',
  'Sassuolo': 'https://upload.wikimedia.org/wikipedia/en/1/1b/US_Sassuolo_Calcio_logo.svg',
  'Empoli': 'https://upload.wikimedia.org/wikipedia/en/c/cb/Empoli_logo_2021.svg',
  'Cagliari': 'https://upload.wikimedia.org/wikipedia/en/6/61/Cagliari_Calcio_1920.svg',
  'Genoa': 'https://upload.wikimedia.org/wikipedia/en/2/23/Genoa_CFC_crest.svg',
  'Hellas Verona': 'https://upload.wikimedia.org/wikipedia/en/9/92/Hellas_Verona_FC_logo_%282020%29.svg',
  'Lecce': 'https://upload.wikimedia.org/wikipedia/en/3/3b/US_Lecce_logo.svg',
  'Monza': 'https://upload.wikimedia.org/wikipedia/en/f/f4/AC_Monza_logo_%282019%29.svg',
  'Venezia': 'https://upload.wikimedia.org/wikipedia/en/1/1f/Venezia_FC_2015_logo.svg',
  'Parma': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_Parma_Calcio_1913_%28adozione_2016%29.svg',
  'Como': 'https://upload.wikimedia.org/wikipedia/en/3/3e/Como_1907_logo.svg',
  // Ligue 1
  'Paris SG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  'PSG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  'Paris Saint-Germain': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
  'OM': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
  'Marseille': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
  'OL': 'https://upload.wikimedia.org/wikipedia/en/a/a5/Olympique_Lyonnais_%28crest%29.svg',
  'Lyon': 'https://upload.wikimedia.org/wikipedia/en/a/a5/Olympique_Lyonnais_%28crest%29.svg',
  'AS Monaco': 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg',
  'Monaco': 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg',
  'LOSC Lille': 'https://upload.wikimedia.org/wikipedia/en/3/3c/Lille_OSC_2018_logo.svg',
  'Lille': 'https://upload.wikimedia.org/wikipedia/en/3/3c/Lille_OSC_2018_logo.svg',
  'OGC Nice': 'https://upload.wikimedia.org/wikipedia/en/2/2e/OGC_Nice_logo.svg',
  'Stade Rennais FC': 'https://upload.wikimedia.org/wikipedia/en/9/9e/Stade_Rennais_FC.svg',
  'RC Lens': 'https://upload.wikimedia.org/wikipedia/en/6/62/RC_Lens_logo.svg',
  'Stade Brestois 29': 'https://upload.wikimedia.org/wikipedia/en/0/03/Stade_Brestois_29_logo.svg',
  'Toulouse FC': 'https://upload.wikimedia.org/wikipedia/en/6/63/Toulouse_FC_2018_logo.svg',
  'FC Nantes': 'https://upload.wikimedia.org/wikipedia/commons/4/40/FC_Nantes_2019_logo.svg',
  'Montpellier': 'https://upload.wikimedia.org/wikipedia/commons/9/99/Montpellier_HSC_logo.svg',
  'Strasbourg': 'https://upload.wikimedia.org/wikipedia/en/8/80/Racing_Club_de_Strasbourg_logo.svg',
  'Stade de Reims': 'https://upload.wikimedia.org/wikipedia/en/1/19/Stade_de_Reims_logo.svg',
  // Eredivisie
  'Ajax': 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
  'PSV': 'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg',
  'Feyenoord': 'https://upload.wikimedia.org/wikipedia/en/a/aa/Feyenoord_logo.svg',
  'AZ': 'https://upload.wikimedia.org/wikipedia/en/7/72/AZ_Alkmaar.svg',
  'FC Twente': 'https://upload.wikimedia.org/wikipedia/en/e/e3/FC_Twente.svg',
  'FC Utrecht': 'https://upload.wikimedia.org/wikipedia/en/a/a8/FC_Utrecht.svg',
  // Portuguese Liga
  'SL Benfica': 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
  'FC Porto': 'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg',
  'Sporting CP': 'https://upload.wikimedia.org/wikipedia/en/3/3e/Sporting_Clube_de_Portugal_%28Logo%29.svg',
  'SC Braga': 'https://upload.wikimedia.org/wikipedia/en/7/79/S.C._Braga_logo.svg',
  // Scottish Premiership
  'Celtic': 'https://upload.wikimedia.org/wikipedia/en/3/35/Celtic_FC.svg',
  'Rangers': 'https://upload.wikimedia.org/wikipedia/en/4/43/Rangers_FC.svg',
  // Saudi Pro League
  'Al Hilal': 'https://upload.wikimedia.org/wikipedia/en/3/34/Al-Hilal_FC_logo.svg',
  'Al Nassr': 'https://upload.wikimedia.org/wikipedia/en/2/2c/Al-Nassr_FC_logo.svg',
  'Al Ittihad': 'https://upload.wikimedia.org/wikipedia/en/3/33/Al-Ittihad_Club_Logo.svg',
  'Al Ahli': 'https://upload.wikimedia.org/wikipedia/en/5/55/Al-Ahli_Saudi_FC_logo.svg',
  'Al Ettifaq': 'https://upload.wikimedia.org/wikipedia/en/0/0b/Ettifaq_FC_logo.svg',
  // MLS
  'Inter Miami CF': 'https://upload.wikimedia.org/wikipedia/en/8/8c/Inter_Miami_CF_logo.svg',
  'LAFC': 'https://upload.wikimedia.org/wikipedia/en/2/28/LAFC_logo.svg',
  'LA Galaxy': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Los_Angeles_Galaxy_logo.svg',
  'Atlanta United': 'https://upload.wikimedia.org/wikipedia/en/4/44/Atlanta_United_FC.svg',
  // Turkish Süper Lig
  'Galatasaray': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Galatasaray_Sports_Club_Logo.svg',
  'Fenerbahçe': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Fenerbahce.svg',
  'Beşiktaş': 'https://upload.wikimedia.org/wikipedia/en/4/41/Besiktas_JK.svg',
  'Trabzonspor': 'https://upload.wikimedia.org/wikipedia/en/c/c5/Trabzonspor_logo.svg',
  // Belgian Pro League  
  'Club Brugge': 'https://upload.wikimedia.org/wikipedia/en/d/d0/Club_Brugge_KV_logo.svg',
  'RSC Anderlecht': 'https://upload.wikimedia.org/wikipedia/commons/9/90/RSC_Anderlecht_logo.svg',
  // Others
  'Shakhtar Donetsk': 'https://upload.wikimedia.org/wikipedia/en/a/a1/FC_Shakhtar_Donetsk.svg',
  'Dynamo Kyiv': 'https://upload.wikimedia.org/wikipedia/en/6/6e/FC_Dynamo_Kyiv_logo.svg',
  'Olympiacos FC': 'https://upload.wikimedia.org/wikipedia/en/b/b8/Olympiacos_CFP_logo.svg',
  'PAOK FC': 'https://upload.wikimedia.org/wikipedia/en/5/5e/PAOK_FC_logo.svg',
  'Slavia Praha': 'https://upload.wikimedia.org/wikipedia/en/d/d5/SK_Slavia_Prague_logo.svg',
  'Sparta Praha': 'https://upload.wikimedia.org/wikipedia/en/a/a3/AC_Sparta_Prague_logo.svg',
  'RB Salzburg': 'https://upload.wikimedia.org/wikipedia/en/7/77/FC_Red_Bull_Salzburg_logo.svg',
  'BSC Young Boys': 'https://upload.wikimedia.org/wikipedia/en/6/6b/BSC_Young_Boys_logo.svg',
  'FC Basel 1893': 'https://upload.wikimedia.org/wikipedia/en/b/b0/FC_Basel_logo.svg',
  'Dinamo Zagreb': 'https://upload.wikimedia.org/wikipedia/en/4/47/GNK_Dinamo_Zagreb.svg',
  // Argentine Primera
  'Boca Juniors': 'https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ70.png',
  'River Plate': 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_C_A_River_Plate.svg',
  'Racing Club': 'https://upload.wikimedia.org/wikipedia/en/5/56/Racing_Club_de_Avellaneda_logo.svg',
  'Independiente': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg'
};

// Display name - truncate long names
const displayName = computed(() => {
  const n = props.name || 'Unknown';
  if (n.length > 14) {
    // Try to use last name only
    const parts = n.split(' ');
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
  }
  return n.toUpperCase();
});

// Get club from team or club prop
const club = computed(() => props.club || props.team || '');

// Club initials (e.g., "Real Madrid" -> "RMA", "Manchester United" -> "MUN")
const clubInitials = computed(() => {
  const c = club.value;
  if (!c) return '';
  
  // Common club abbreviations
  const CLUB_ABBREVS = {
    'Real Madrid': 'RMA', 'Barcelona': 'BAR', 'Atlético Madrid': 'ATM',
    'Manchester United': 'MUN', 'Manchester City': 'MCI', 'Man United': 'MUN', 'Man City': 'MCI',
    'Liverpool': 'LIV', 'Chelsea': 'CHE', 'Arsenal': 'ARS', 'Tottenham': 'TOT', 'Spurs': 'TOT',
    'Bayern Munich': 'BAY', 'Dortmund': 'BVB', 'PSG': 'PSG', 'Juventus': 'JUV',
    'AC Milan': 'MIL', 'Inter Milan': 'INT', 'Inter': 'INT', 'Roma': 'ROM', 'Napoli': 'NAP',
    'Newcastle': 'NEW', 'West Ham': 'WHU', 'Aston Villa': 'AVL', 'Brighton': 'BHA',
    'Wolves': 'WOL', 'Crystal Palace': 'CRY', 'Everton': 'EVE', 'Leeds': 'LEE',
    'Leicester': 'LEI', 'Southampton': 'SOU', 'Fulham': 'FUL', 'Brentford': 'BRE',
    'Nottm Forest': 'NFO', 'Bournemouth': 'BOU', 'Burnley': 'BUR'
  };
  
  if (CLUB_ABBREVS[c]) return CLUB_ABBREVS[c];
  
  // Generate initials from words
  const words = c.replace(/FC|CF|SC|AC|AS|SS|SL|CD/gi, '').trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0] + (words[1][1] || '')).toUpperCase();
  }
  return c.substring(0, 3).toUpperCase();
});

// Flag URL using flagcdn.com
const flagUrl = computed(() => {
  const nat = props.nationality || '';
  const code = COUNTRY_CODES[nat] || '';
  if (!code) return '';
  return `https://flagcdn.com/w40/${code}.png`;
});

// Club logo URL
const clubLogoUrl = computed(() => {
  const c = club.value;
  return CLUB_LOGOS[c] || '';
});

// Handle club image error - show initials fallback
const handleClubImgError = (event) => {
  event.target.style.display = 'none';
};

// League logo URL
const leagueLogoUrl = computed(() => {
  const l = props.league || '';
  return LEAGUE_LOGOS[l] || '';
});

// Handle league image error - show text fallback
const handleLeagueImgError = (event) => {
  const parent = event.target.parentElement;
  event.target.style.display = 'none';
  // Create text fallback
  const span = document.createElement('span');
  span.className = 'text-[6px] font-bold text-gray-800 bg-white/90 w-full h-full flex items-center justify-center';
  span.textContent = leagueShort.value;
  parent.appendChild(span);
};

// Short league name
const leagueShort = computed(() => {
  const l = props.league || '';
  if (l.includes('Premier')) return 'PL';
  if (l.includes('La Liga')) return 'LL';
  if (l.includes('Bundesliga')) return 'BL';
  if (l.includes('Serie A')) return 'SA';
  if (l.includes('Ligue 1')) return 'L1';
  if (l.length > 6) return l.substring(0, 4);
  return l;
});

// Card rarity determines colors - based on rating if rarity not set
const effectiveRarity = computed(() => {
  if (props.rarity) return props.rarity;
  const r = props.rating || 0;
  if (r >= 85) return 'gold-rare';   // 85+: Gold Rare
  if (r >= 76) return 'gold';        // 84-76: Gold
  if (r >= 69) return 'silver-rare'; // 75-69: Silver Rare
  if (r >= 59) return 'silver';      // 68-59: Silver
  if (r >= 54) return 'bronze-rare'; // 58-54: Bronze Rare
  return 'bronze';                   // 53-: Bronze
});

// Check if the card is rare (has shimmer effect)
const isRare = computed(() => {
  const rarity = effectiveRarity.value;
  return rarity === 'gold-rare' || rarity === 'silver-rare' || rarity === 'bronze-rare';
});

// Background gradient based on rarity
const cardBackgroundClass = computed(() => {
  switch (effectiveRarity.value) {
    case 'gold-rare':
      return 'bg-gradient-to-b from-yellow-400 via-yellow-500 to-amber-600';
    case 'gold':
      return 'bg-gradient-to-b from-yellow-500 via-yellow-600 to-amber-700';
    case 'silver-rare':
      return 'bg-gradient-to-b from-gray-200 via-gray-400 to-gray-500';
    case 'silver':
      return 'bg-gradient-to-b from-gray-400 via-gray-500 to-gray-700';
    case 'bronze-rare':
      return 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700';
    case 'bronze':
    default:
      return 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950';
  }
});

// Border color based on rarity
const borderClass = computed(() => {
  switch (effectiveRarity.value) {
    case 'gold-rare':
      return 'border-yellow-200/80';
    case 'gold':
      return 'border-yellow-500/50';
    case 'silver-rare':
      return 'border-gray-100/80';
    case 'silver':
      return 'border-gray-400/50';
    case 'bronze-rare':
      return 'border-amber-400/80';
    case 'bronze':
    default:
      return 'border-amber-600/50';
  }
});
</script>

<style scoped>
/* FIFA-style rounded shield/card shape */
.shield-shape {
  clip-path: polygon(
    /* Top edge - straight with rounded corners handled by border-radius */
    0% 0%,
    100% 0%,
    /* Right side - curves inward toward bottom */
    100% 75%,
    95% 82%,
    85% 89%,
    70% 95%,
    /* Bottom point - rounded curve */
    50% 100%,
    /* Left side - mirrors right side */
    30% 95%,
    15% 89%,
    5% 82%,
    0% 75%
  );
  border-radius: 12px 12px 0 0;
}

/* Rare card stripes effect - diagonal lines in corner like FIFA */
.rare-stripes {
  mask-image: linear-gradient(to bottom left, black 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom left, black 0%, transparent 100%);
}

.rare-stripe-pattern {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(255, 255, 255, 0.35) 4px,
    rgba(255, 255, 255, 0.35) 10px
  );
}
</style>
