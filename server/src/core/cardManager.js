// Trigger restart: New Player Tomás Costa
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbRequest } from '../infrastructure/db/repository.js';
import { aliasManager } from './aliasManager.js';
import { calculateRatings } from './ratingCalculator.js';
import { Team } from './team.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load all base players from DB
const TEAM_LEAGUE_MAP = {
    // Premier League
    'Arsenal': 'Premier League', 'Aston Villa': 'Premier League', 'AFC Bournemouth': 'Premier League',
    'Bournemouth': 'Premier League', 'Brentford': 'Premier League', 'Brighton': 'Premier League',
    'Burnley': 'Premier League', 'Chelsea': 'Premier League', 'Crystal Palace': 'Premier League',
    'Everton': 'Premier League', 'Fulham': 'Premier League', 'Ipswich': 'Premier League',
    'Leicester City': 'Premier League', 'Liverpool': 'Premier League', 'Luton Town': 'Premier League',
    'Man City': 'Premier League', 'Manchester City': 'Premier League', 'Man Utd': 'Premier League',
    'Man United': 'Premier League', 'Manchester Utd': 'Premier League', 'Manchester United': 'Premier League',
    'Newcastle': 'Premier League', 'Newcastle Utd': 'Premier League', "Nott'm Forest": 'Premier League',
    'Nottm Forest': 'Premier League', 'Sheffield Utd': 'Premier League', 'Southampton': 'Premier League',
    'Spurs': 'Premier League', 'Tottenham Hotspur': 'Premier League', 'Tottenham': 'Premier League',
    'West Ham': 'Premier League', 'Wolves': 'Premier League',
    // Championship
    'Birmingham City': 'Championship', 'Blackburn Rovers': 'Championship', 'Blackpool': 'Championship',
    'Bristol City': 'Championship', 'Cardiff City': 'Championship', 'Coventry City': 'Championship',
    'Derby County': 'Championship', 'Huddersfield': 'Championship', 'Hull City': 'Championship',
    'Leeds United': 'Championship', 'Middlesbrough': 'Championship', 'Millwall': 'Championship',
    'Norwich': 'Championship', 'Plymouth Argyle': 'Championship', 'Portsmouth': 'Championship',
    'Preston': 'Championship', 'QPR': 'Championship', 'Sheffield Wed': 'Championship',
    'Stoke City': 'Championship', 'Sunderland': 'Championship', 'Swansea City': 'Championship',
    'Watford': 'Championship', 'West Brom': 'Championship', 'Wigan Athletic': 'Championship',
    // La Liga
    'Real Madrid': 'La Liga', 'FC Barcelona': 'La Liga', 'Barcelona': 'La Liga',
    'Atlético de Madrid': 'La Liga', 'Atlético Madrid': 'La Liga', 'Atletico Madrid': 'La Liga',
    'Athletic Club': 'La Liga', 'Sevilla FC': 'La Liga', 'Sevilla': 'La Liga',
    'Valencia CF': 'La Liga', 'Valencia': 'La Liga', 'Villarreal CF': 'La Liga', 'Villarreal': 'La Liga',
    'Real Sociedad': 'La Liga', 'Real Betis': 'La Liga', 'Getafe CF': 'La Liga',
    'CA Osasuna': 'La Liga', 'Celta': 'La Liga', 'Girona FC': 'La Liga',
    'Rayo Vallecano': 'La Liga', 'RCD Mallorca': 'La Liga', 'UD Las Palmas': 'La Liga',
    'D. Alavés': 'La Liga', 'CD Leganés': 'La Liga', 'RCD Espanyol': 'La Liga',
    // Bundesliga
    'FC Bayern München': 'Bundesliga', 'Bayern Munich': 'Bundesliga', 'Borussia Dortmund': 'Bundesliga',
    'Dortmund': 'Bundesliga', 'RB Leipzig': 'Bundesliga', 'Leverkusen': 'Bundesliga',
    'Bayer Leverkusen': 'Bundesliga', 'VfB Stuttgart': 'Bundesliga', 'Frankfurt': 'Bundesliga',
    "M'gladbach": 'Bundesliga', 'VfL Wolfsburg': 'Bundesliga', 'FC Augsburg': 'Bundesliga',
    'SC Freiburg': 'Bundesliga', 'TSG Hoffenheim': 'Bundesliga', 'Union Berlin': 'Bundesliga',
    'VfL Bochum 1848': 'Bundesliga', 'SV Werder Bremen': 'Bundesliga', 'FC Schalke 04': 'Bundesliga',
    'Holstein Kiel': 'Bundesliga', 'FC St. Pauli': 'Bundesliga', 'Heidenheim': 'Bundesliga',
    '1. FSV Mainz 05': 'Bundesliga',
    // 2. Bundesliga
    '1. FC Köln': '2. Bundesliga', '1. FC Magdeburg': '2. Bundesliga', '1. FC Nürnberg': '2. Bundesliga',
    '1860 München': '2. Bundesliga', 'Hamburger SV': '2. Bundesliga', 'Hannover 96': '2. Bundesliga',
    'Hertha BSC': '2. Bundesliga', 'Fortuna Düsseldorf': '2. Bundesliga', 'Düsseldorf': '2. Bundesliga',
    'Karlsruher SC': '2. Bundesliga', 'Kaiserslautern': '2. Bundesliga', 'Braunschweig': '2. Bundesliga',
    // Serie A
    'Juventus': 'Serie A', 'AC Milan': 'Serie A', 'Inter Milan': 'Serie A', 'Inter': 'Serie A',
    'AS Roma': 'Serie A', 'Roma': 'Serie A', 'SSC Napoli': 'Serie A', 'Napoli': 'Serie A',
    'Lazio': 'Serie A', 'Fiorentina': 'Serie A', 'Atalanta': 'Serie A', 'Bologna': 'Serie A',
    'Torino': 'Serie A', 'Udinese': 'Serie A', 'Sassuolo': 'Serie A', 'Empoli': 'Serie A',
    'Cagliari': 'Serie A', 'Genoa': 'Serie A', 'Hellas Verona': 'Serie A', 'Lecce': 'Serie A',
    'Monza': 'Serie A', 'Venezia': 'Serie A', 'Parma': 'Serie A', 'Como': 'Serie A',
    'Lombardia FC': 'Serie A', 'Milano FC': 'Serie A', 'Latium': 'Serie A',
    // Ligue 1
    'Paris SG': 'Ligue 1', 'PSG': 'Ligue 1', 'Paris Saint-Germain': 'Ligue 1',
    'OM': 'Ligue 1', 'Marseille': 'Ligue 1', 'OL': 'Ligue 1', 'Lyon': 'Ligue 1',
    'AS Monaco': 'Ligue 1', 'Monaco': 'Ligue 1', 'LOSC Lille': 'Ligue 1', 'Lille': 'Ligue 1',
    'OGC Nice': 'Ligue 1', 'Stade Rennais FC': 'Ligue 1', 'RC Lens': 'Ligue 1',
    'Stade Brestois 29': 'Ligue 1', 'Toulouse FC': 'Ligue 1', 'FC Nantes': 'Ligue 1',
    'Montpellier': 'Ligue 1', 'Strasbourg': 'Ligue 1', 'Stade de Reims': 'Ligue 1',
    'AJ Auxerre': 'Ligue 1', 'Angers SCO': 'Ligue 1', 'AS Saint-Étienne': 'Ligue 1',
    'AS Saint Étienne': 'Ligue 1', 'Paris FC': 'Ligue 1',
    // Ligue 2
    'Amiens SC': 'Ligue 2', 'FC Metz': 'Ligue 2', 'Grenoble Foot 38': 'Ligue 2',
    'FC Lorient': 'Ligue 2', 'Pau FC': 'Ligue 2',
    // Eredivisie
    'Ajax': 'Eredivisie', 'PSV': 'Eredivisie', 'Feyenoord': 'Eredivisie', 'AZ': 'Eredivisie',
    'FC Twente': 'Eredivisie', 'FC Utrecht': 'Eredivisie', 'FC Groningen': 'Eredivisie',
    'sc Heerenveen': 'Eredivisie', 'Sparta Rotterdam': 'Eredivisie', 'Fortuna Sittard': 'Eredivisie',
    'Go Ahead Eagles': 'Eredivisie', 'N.E.C. Nijmegen': 'Eredivisie', 'NAC Breda': 'Eredivisie',
    'PEC Zwolle': 'Eredivisie', 'Heracles Almelo': 'Eredivisie', 'FC Volendam': 'Eredivisie',
    'Excelsior': 'Eredivisie',
    // Portuguese Liga
    'SL Benfica': 'Liga Portugal', 'FC Porto': 'Liga Portugal', 'Sporting CP': 'Liga Portugal',
    'SC Braga': 'Liga Portugal', 'Vitória SC': 'Liga Portugal', 'Rio Ave FC': 'Liga Portugal',
    'Arouca': 'Liga Portugal', 'Casa Pia AC': 'Liga Portugal', 'Estoril Praia': 'Liga Portugal',
    'FC Famalicão': 'Liga Portugal', 'Gil Vicente': 'Liga Portugal', 'Moreirense FC': 'Liga Portugal',
    'Santa Clara': 'Liga Portugal', 'Boavista': 'Liga Portugal',
    // Belgian Pro League
    'Club Brugge': 'Belgian Pro League', 'RSC Anderlecht': 'Belgian Pro League',
    'KRC Genk': 'Belgian Pro League', 'Royal Antwerp FC': 'Belgian Pro League',
    'KAA Gent': 'Belgian Pro League', 'Standard Liège': 'Belgian Pro League',
    'Cercle Brugge': 'Belgian Pro League', 'KV Mechelen': 'Belgian Pro League',
    'OH Leuven': 'Belgian Pro League', 'KVC Westerlo': 'Belgian Pro League',
    'Sp. Charleroi': 'Belgian Pro League', 'STVV': 'Belgian Pro League',
    'R. Union St.-G.': 'Belgian Pro League', 'Zulte Waregem': 'Belgian Pro League',
    // Scottish Premiership
    'Celtic': 'Scottish Premiership', 'Rangers': 'Scottish Premiership', 'Aberdeen': 'Scottish Premiership',
    'Hearts': 'Scottish Premiership', 'Hibernian': 'Scottish Premiership', 'Dundee FC': 'Scottish Premiership',
    'Dundee United': 'Scottish Premiership', 'Kilmarnock': 'Scottish Premiership',
    'Motherwell': 'Scottish Premiership', 'St. Mirren': 'Scottish Premiership',
    'Livingston': 'Scottish Premiership', 'Ross County': 'Scottish Premiership',
    // Turkish Süper Lig
    'Galatasaray': 'Süper Lig', 'Fenerbahçe': 'Süper Lig', 'Beşiktaş': 'Süper Lig',
    'Trabzonspor': 'Süper Lig', 'Başakşehir': 'Süper Lig', 'Alanyaspor': 'Süper Lig',
    'Antalyaspor': 'Süper Lig', 'Konyaspor': 'Süper Lig', 'Kasımpaşa': 'Süper Lig',
    'Kayserispor': 'Süper Lig', 'Gaziantep': 'Süper Lig', 'Samsunspor': 'Süper Lig',
    'Göztepe': 'Süper Lig', 'Eyüpspor': 'Süper Lig', 'Karagümrük SK': 'Süper Lig',
    // Saudi Pro League
    'Al Hilal': 'Saudi Pro League', 'Al Nassr': 'Saudi Pro League', 'Al Ittihad': 'Saudi Pro League',
    'Al Ahli': 'Saudi Pro League', 'Al Ettifaq': 'Saudi Pro League', 'Al Fateh': 'Saudi Pro League',
    'Al Fayha': 'Saudi Pro League', 'Al Hazem': 'Saudi Pro League', 'Al Khaleej': 'Saudi Pro League',
    'Al Kholood': 'Saudi Pro League', 'Al Najmah': 'Saudi Pro League', 'Al Okhdood': 'Saudi Pro League',
    'Al Qadsiah': 'Saudi Pro League', 'Al Riyadh': 'Saudi Pro League', 'Al Shabab': 'Saudi Pro League',
    'Al Taawoun': 'Saudi Pro League', 'Damac': 'Saudi Pro League', 'Neom': 'Saudi Pro League',
    // MLS
    'Inter Miami CF': 'MLS', 'LAFC': 'MLS', 'LA Galaxy': 'MLS', 'Atlanta United': 'MLS',
    'New York City FC': 'MLS', 'Red Bulls': 'MLS', 'Philadelphia': 'MLS', 'Seattle Sounders': 'MLS',
    'Portland Timbers': 'MLS', 'Colorado Rapids': 'MLS', 'Columbus Crew': 'MLS',
    'Houston Dynamo': 'MLS', 'Nashville SC': 'MLS', 'Austin FC': 'MLS', 'FC Cincinnati': 'MLS',
    'Real Salt Lake': 'MLS', 'Sporting KC': 'MLS', 'Minnesota United': 'MLS',
    'New England': 'MLS', 'D.C. United': 'MLS', 'CF Montréal': 'MLS', 'Toronto FC': 'MLS',
    'Whitecaps FC': 'MLS', 'Charlotte FC': 'MLS', 'Chicago Fire FC': 'MLS',
    'SJ Earthquakes': 'MLS', 'San Diego FC': 'MLS', 'St. Louis CITY SC': 'MLS',
    // NWSL (Women)
    'Portland Thorns': 'NWSL', 'Gotham FC': 'NWSL', 'KC Current': 'NWSL', 'Chicago Stars FC': 'NWSL',
    'Washington Spirit': 'NWSL', 'Angel City FC': 'NWSL', 'Orlando Pride': 'NWSL',
    'San Diego Wave': 'NWSL', 'Houston Dash': 'NWSL', 'North Carolina Courage': 'NWSL',
    'NC Courage': 'NWSL', 'Bay FC': 'NWSL', 'Utah Royals FC': 'NWSL', 'Racing Louisville': 'NWSL',
    'Rac. Louisville': 'NWSL', 'Seattle Reign': 'NWSL', 'Houston Dash': 'NWSL',
    // WSL (Women England)
    'London City': 'WSL', 'Manchester City Women': 'WSL', 'Chelsea Women': 'WSL',
    'Arsenal Women': 'WSL', 'Manchester United Women': 'WSL', 'Liverpool Women': 'WSL',
    'Tottenham Women': 'WSL', 'West Ham Women': 'WSL', 'Everton Women': 'WSL',
    'Aston Villa Women': 'WSL', 'Brighton Women': 'WSL', 'Leicester Women': 'WSL',
    // Division 1 Féminine (Women France)
    'OL Lyonnes': 'Division 1 Féminine', 'Paris FC Women': 'Division 1 Féminine',
    'Paris SG Women': 'Division 1 Féminine', 'Montpellier Women': 'Division 1 Féminine',
    // Liga F (Women Spain)
    'FC Barcelona Femení': 'Liga F', 'Real Madrid Femenino': 'Liga F', 'Atlético Madrid Femenino': 'Liga F',
    'Levante UD Femenino': 'Liga F', 'Real Sociedad Women': 'Liga F', 'Athletic Club Women': 'Liga F',
    'Sevilla FC Women': 'Liga F', 'Badalona Women': 'Liga F',
    // Frauen-Bundesliga (Women Germany)  
    'VfL Wolfsburg Women': 'Frauen-Bundesliga', 'FC Bayern Women': 'Frauen-Bundesliga',
    'Eintracht Frankfurt Women': 'Frauen-Bundesliga', 'TSG Hoffenheim Women': 'Frauen-Bundesliga',
    'Werder Bremen Women': 'Frauen-Bundesliga', 'SGS Essen': 'Frauen-Bundesliga',
    // Serie A Femminile (Women Italy)
    'Juventus Women': 'Serie A Femminile', 'AC Milan Women': 'Serie A Femminile',
    'Inter Women': 'Serie A Femminile', 'Roma Women': 'Serie A Femminile',
    'Fiorentina Women': 'Serie A Femminile', 'Sassuolo Women': 'Serie A Femminile',
    // Damallsvenskan (Women Sweden)
    'FC Rosengård': 'Damallsvenskan', 'BK Häcken Women': 'Damallsvenskan',
    'Hammarby Women': 'Damallsvenskan', 'Djurgårdens IF Women': 'Damallsvenskan',
    // Toppserien (Women Norway)
    'Vålerenga Women': 'Toppserien', 'Rosenborg Women': 'Toppserien', 'LSK Kvinner': 'Toppserien',
    // Danish Superliga
    'FC København': 'Danish Superliga', 'FC Midtjylland': 'Danish Superliga', 'Brøndby IF': 'Danish Superliga',
    'FC Nordsjælland': 'Danish Superliga', 'AGF': 'Danish Superliga', 'Randers FC': 'Danish Superliga',
    'Silkeborg IF': 'Danish Superliga', 'Viborg FF': 'Danish Superliga', 'Odense BK': 'Danish Superliga',
    'Vejle Boldklub': 'Danish Superliga', 'Sønderjyske': 'Danish Superliga', 'FC Fredericia': 'Danish Superliga',
    // Swedish Allsvenskan
    'Malmö FF': 'Allsvenskan', 'AIK': 'Allsvenskan', 'Djurgårdens IF': 'Allsvenskan',
    'Hammarby IF': 'Allsvenskan', 'IF Elfsborg': 'Allsvenskan', 'IFK Göteborg': 'Allsvenskan',
    'IFK Norrköping': 'Allsvenskan', 'BK Häcken': 'Allsvenskan', 'Brommapojkarna': 'Allsvenskan',
    'IFK Värnamo': 'Allsvenskan', 'Mjällby AIF': 'Allsvenskan', 'GAIS': 'Allsvenskan',
    'Degerfors IF': 'Allsvenskan', 'Halmstads BK': 'Allsvenskan', 'IK Sirius': 'Allsvenskan',
    // Norwegian Eliteserien
    'FK Bodø/Glimt': 'Eliteserien', 'Molde FK': 'Eliteserien', 'Rosenborg BK': 'Eliteserien',
    'SK Brann': 'Eliteserien', 'Viking FK': 'Eliteserien', 'Tromsø IL': 'Eliteserien',
    'Strømsgodset IF': 'Eliteserien', 'Vålerenga Fotball': 'Eliteserien', 'Sarpsborg 08': 'Eliteserien',
    'Fredrikstad FK': 'Eliteserien', 'Kristiansund BK': 'Eliteserien', 'FK Haugesund': 'Eliteserien',
    'Sandefjord': 'Eliteserien', 'HamKam Fotball': 'Eliteserien', 'KFUM-Kameratene': 'Eliteserien',
    // Swiss Super League
    'BSC Young Boys': 'Swiss Super League', 'FC Basel 1893': 'Swiss Super League',
    'FC Zürich': 'Swiss Super League', 'Servette FC': 'Swiss Super League', 'FC Lugano': 'Swiss Super League',
    'FC St. Gallen': 'Swiss Super League', 'FC Luzern': 'Swiss Super League', 'FC Sion': 'Swiss Super League',
    'Lausanne-Sport': 'Swiss Super League', 'GC Zürich': 'Swiss Super League', 'FC Winterthur': 'Swiss Super League',
    // Austrian Bundesliga
    'RB Salzburg': 'Austrian Bundesliga', 'SK Rapid': 'Austrian Bundesliga', 'SK Sturm Graz': 'Austrian Bundesliga',
    'FK Austria Wien': 'Austrian Bundesliga', 'LASK': 'Austrian Bundesliga', 'Wolfsberger AC': 'Austrian Bundesliga',
    'TSV Hartberg': 'Austrian Bundesliga', 'SCR Altach': 'Austrian Bundesliga', 'WSG Tirol': 'Austrian Bundesliga',
    'Blau-Weiss Linz': 'Austrian Bundesliga', 'Grazer AK': 'Austrian Bundesliga',
    // Greek Super League
    'Olympiacos FC': 'Greek Super League', 'Panathinaikos': 'Greek Super League',
    'AEK Athens': 'Greek Super League', 'PAOK FC': 'Greek Super League', 'Aris': 'Greek Super League',
    // Czech First League
    'Slavia Praha': 'Czech First League', 'Sparta Praha': 'Czech First League',
    'Viktoria Plzeň': 'Czech First League',
    // Croatian First League
    'Dinamo Zagreb': 'Croatian First League', 'Hajduk Split': 'Croatian First League',
    // Ukrainian Premier League
    'Shakhtar Donetsk': 'Ukrainian Premier League', 'Dynamo Kyiv': 'Ukrainian Premier League',
    // Polish Ekstraklasa
    'Lech Poznań': 'Ekstraklasa', 'Legia Warszawa': 'Ekstraklasa', 'Raków': 'Ekstraklasa',
    'Jagiellonia': 'Ekstraklasa', 'Pogoń Szczecin': 'Ekstraklasa', 'Cracovia': 'Ekstraklasa',
    'Piast Gliwice': 'Ekstraklasa', 'Górnik Zabrze': 'Ekstraklasa', 'Zagłębie Lubin': 'Ekstraklasa',
    'Korona Kielce': 'Ekstraklasa', 'Widzew Łódź': 'Ekstraklasa', 'Motor Lublin': 'Ekstraklasa',
    'GKS Katowice': 'Ekstraklasa', 'Radomiak Radom': 'Ekstraklasa', 'Lechia Gdańsk': 'Ekstraklasa',
    // Romanian Liga I
    'FCSB': 'Liga I', 'CFR 1907 Cluj': 'Liga I', 'Universitatea Craiova': 'Liga I',
    // Argentine Primera División
    'Boca Juniors': 'Argentine Primera', 'River Plate': 'Argentine Primera', 'Racing Club': 'Argentine Primera',
    'Independiente': 'Argentine Primera', 'Lanús': 'Argentine Primera', 'Vélez Sarsfield': 'Argentine Primera',
    'Estudiantes': 'Argentine Primera', 'San Lorenzo': 'Argentine Primera', 'Talleres': 'Argentine Primera',
    'Argentinos Jrs.': 'Argentine Primera', 'Banfield': 'Argentine Primera', 'Belgrano': 'Argentine Primera',
    'Godoy Cruz': 'Argentine Primera', 'Gimnasia': 'Argentine Primera', 'Huracán': 'Argentine Primera',
    // Brazilian Serie A
    'Flamengo': 'Brasileirão', 'Palmeiras': 'Brasileirão', 'Corinthians': 'Brasileirão',
    'São Paulo': 'Brasileirão', 'Atlético Mineiro': 'Brasileirão', 'Internacional': 'Brasileirão',
    'Grêmio': 'Brasileirão', 'Fluminense': 'Brasileirão', 'Botafogo': 'Brasileirão',
    // Mexican Liga MX
    'Club América': 'Liga MX', 'Guadalajara': 'Liga MX', 'Monterrey': 'Liga MX',
    'Tigres UANL': 'Liga MX', 'Cruz Azul': 'Liga MX', 'Pumas UNAM': 'Liga MX',
    // K League (Korean)
    'FC Seoul': 'K League 1', 'Ulsan HD FC': 'K League 1', 'Jeonbuk Hyundai': 'K League 1',
    'Pohang Steelers': 'K League 1', 'Gangwon FC': 'K League 1', 'Gwangju FC': 'K League 1',
    'Daegu FC': 'K League 1', 'Daejeon Hana': 'K League 1', 'Jeju United': 'K League 1',
    'Suwon FC': 'K League 1', 'Gimcheon Sangmu': 'K League 1', 'FC Anyang': 'K League 1',
    // J League (Japanese)
    'Urawa Reds': 'J1 League', 'Yokohama F. Marinos': 'J1 League', 'Vissel Kobe': 'J1 League',
    'Kawasaki Frontale': 'J1 League',
    // Chinese Super League
    'Shanghai Port FC': 'Chinese Super League', 'Shanghai Shenhua': 'Chinese Super League',
    'Shandong Taishan': 'Chinese Super League', 'Beijing FC': 'Chinese Super League',
    'Wuhan Three Towns': 'Chinese Super League', 'Changchun Yatai': 'Chinese Super League',
    'Tianjin JMT FC': 'Chinese Super League', 'Zhejiang Pro': 'Chinese Super League',
    // A-League (Australia)
    'Sydney FC': 'A-League', 'Melbourne Victory': 'A-League', 'Melb. Victory': 'A-League',
    'Melbourne City': 'A-League', 'Brisbane Roar': 'A-League', 'Central Coast': 'A-League',
    'Adelaide United': 'A-League', 'Newcastle Jets': 'A-League', 'WS Wanderers': 'A-League',
    'Perth Glory': 'A-League', 'Well. Phoenix': 'A-League', 'Macarthur FC': 'A-League',
    'Auckland FC': 'A-League',
    // Indian Super League
    'Mumbai City FC': 'Indian Super League', 'Mohun Bagan SG': 'Indian Super League',
    'East Bengal': 'Indian Super League', 'Kerala Blasters': 'Indian Super League',
    'Bengaluru FC': 'Indian Super League', 'FC Goa': 'Indian Super League',
    'Chennaiyin FC': 'Indian Super League', 'Hyderabad FC': 'Indian Super League',
    'Jamshedpur FC': 'Indian Super League', 'NorthEast United': 'Indian Super League',
    'Odisha FC': 'Indian Super League', 'Punjab FC': 'Indian Super League',
    // Irish
    'Shamrock Rovers': 'League of Ireland', 'Bohemians': 'League of Ireland',
    'St. Pats': 'League of Ireland', "St Patrick's": 'League of Ireland',
    'Dundalk': 'League of Ireland', 'Derry City': 'League of Ireland',
    'Shelbourne': 'League of Ireland', 'Galway United': 'League of Ireland',
    'Sligo Rovers': 'League of Ireland', 'Cork City': 'League of Ireland',
    'Drogheda United': 'League of Ireland', 'Waterford': 'League of Ireland',
    // Cypriot
    'APOEL FC': 'Cypriot First Division',
    // UEFA competitions placeholder
    'Qarabağ FK': 'Azerbaijan Premier', 'Ferencvárosi TC': 'NB I'
};

const getLeague = (teamName) => {
    if (!teamName) return 'Unknown League';
    // Direct match
    if (TEAM_LEAGUE_MAP[teamName]) return TEAM_LEAGUE_MAP[teamName];
    // Partial match fallback
    if (teamName.includes('Lightning') || teamName.includes('Titans')) return 'Super League';
    return 'Unknown League';
};

const loadAllPlayers = () => {
    try {
        const players = aliasManager.getAllPlayersWithAliases();
        if (players.length === 0) {
            console.log('⚠️ No players in database. Using fallback JSON data?');
            // Fallback for initial run before scrape
            try {
                const teamA = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/fc_lightning.json'), 'utf-8'));
                const teamB = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/real_titans.json'), 'utf-8'));
                const rawPlayers = [...teamA.players, ...teamB.players];

                // Normalize JSON structure to match DB structure
                return rawPlayers.map(p => {
                    const team = p.id.includes('lightning') ? 'FC Lightning' : 'Real Titans';
                    return {
                        id: p.id,
                        name: p.name,
                        position: p.position,
                        // Flatten attributes
                        power: p.attributes.power,
                        shoot: p.attributes.shoot,
                        tackle: p.attributes.tackle,
                        pass: p.attributes.pass,
                        // Metadata - Ensure these exist or use defaults
                        overallRating: Math.round((p.attributes.power + p.attributes.shoot + p.attributes.tackle + p.attributes.pass) / 4), // Approximate rating if missing
                        team: team,
                        league: getLeague(team),
                        nationality: 'Unknown',
                        imageUrl: null,
                        detailedStats: null
                    };
                });
            } catch (e) {
                console.error('Error loading fallback JSON:', e);
                return [];
            }
        }

        // Map DB structure to expected game structure
        return players.map(p => {
            const team = p.team_display_name || p.team_name;
            return {
                id: p.ea_player_id,
                name: p.display_name || p.real_name,
                position: p.position,
                // Stats
                power: p.power,
                shoot: p.shoot,
                tackle: p.tackle,
                pass: p.pass,
                // Metadata
                overallRating: p.overall_rating,
                // Calculate ratings for all positions
                ratings: calculateRatings({
                    shoot: p.shoot,
                    pass: p.pass,
                    dribbling: p.dribbling,
                    tackle: p.tackle,
                    power: p.power,
                    position: p.position,
                    overallRating: p.overall_rating
                }),
                team: team,
                league: getLeague(team),
                nationality: p.nationality,
                imageUrl: p.image_url,
                detailedStats: p.detailed_stats ? JSON.parse(p.detailed_stats) : null
            };
        });
    } catch (e) {
        console.error('Error loading players:', e);
        return [];
    }
};

const ALL_PLAYERS = loadAllPlayers();
console.log(`[DEBUG] cardManager loaded ${ALL_PLAYERS.length} players from DB`);
const ben = ALL_PLAYERS.find(p => p.id === '999002');
if (ben) console.log('[DEBUG] Benjamin Data:', ben);
const jak = ALL_PLAYERS.find(p => p.id === '999001');
if (jak) console.log('[DEBUG] Jakob Data:', jak);

export const cardManager = {
    // Grant starter pack (25 players)
    grantStarterPack: (userId) => {
        // Requirements:
        // - 25 players total
        // - 1 Gold Rare, 6 Gold, 8 Silver Rare, 8 Silver, 2 Bronze Rare
        // - Position coverage: 1 for each position + Mandatory GK
        // - OVR range: 49-87

        const pack = [];
        const addedPlayerIds = new Set();

        // Define Rarity Ranges (based on DashboardView logic)
        // Gold Rare: 85-87 (capped at 87)
        // Gold: 76-84
        // Silver Rare: 69-75
        // Silver: 59-68
        // Bronze Rare: 54-58
        // Bronze: < 54 (Used as fallback/filler if needed, but we have specific counts)

        // Target Counts
        const targets = [
            { type: 'gold-rare', count: 1, min: 85, max: 87 },
            { type: 'gold', count: 6, min: 76, max: 84 },
            { type: 'silver-rare', count: 8, min: 69, max: 75 },
            { type: 'silver', count: 8, min: 59, max: 68 },
            { type: 'bronze-rare', count: 2, min: 54, max: 58 }
        ];

        // Collect all positions to ensure coverage
        // Standard FIFA-ish positions: GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF
        // We want to try to cover as many unique positions as possible within the 25 cards.
        // At minimum, we NEED a GK.

        const allPositions = [...new Set(ALL_PLAYERS.map(p => p.position))];
        const coveredPositions = new Set();

        // 1. Mandatory GK checks
        // We'll prioritize getting a GK in one of the lower tiers if possible to save high tiers for outfield, 
        // but let's just let it happen naturally or force it if missing at the end of a tier pass?
        // Actually, let's pre-fill the "required" slots first.

        // Prepare pool for each tier
        const pools = {};
        targets.forEach(t => {
            pools[t.type] = ALL_PLAYERS.filter(p => {
                const r = p.overallRating || 0;
                return r >= t.min && r <= t.max;
            });
        });

        // Helper to pick random from pool
        const pick = (pool, positionReq = null) => {
            let candidates = pool.filter(p => !addedPlayerIds.has(p.id));

            if (positionReq) {
                const posCandidates = candidates.filter(p => p.position === positionReq);
                if (posCandidates.length > 0) candidates = posCandidates;
                // If no candidates for that specific position in this tier, we fall back to general pool for this tier
                // and try to fill position in another tier.
            }

            if (candidates.length === 0) return null;

            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            return chosen;
        };

        // We need 25 cards. 
        // Strategy: 
        // 1. Iterate through targets.
        // 2. For each card in target, try to fill a valid position that hasn't been covered yet.
        // 3. If all positions covered (or no matching position card in tier), pick random.

        // Let's create a "wishlist" of positions to fill.
        // We surely want a GK.
        // Then we want to fill as many unique positions as possible.
        let positionWishlist = ['GK', ...allPositions.filter(p => p !== 'GK')];

        targets.forEach(tier => {
            for (let i = 0; i < tier.count; i++) {
                let picked = null;

                // Try to fill a wishlist position
                for (let j = 0; j < positionWishlist.length; j++) {
                    const pos = positionWishlist[j];
                    picked = pick(pools[tier.type], pos);

                    if (picked) {
                        // Found a card for a wishlist position!
                        positionWishlist.splice(j, 1); // Remove from wishlist
                        break;
                    }
                }

                // If we couldn't fill a wishlist position (or wishlist empty), pick random from tier
                if (!picked) {
                    picked = pick(pools[tier.type]);
                }

                if (picked) {
                    pack.push(picked);
                    addedPlayerIds.add(picked.id);
                    coveredPositions.add(picked.position);
                }
            }
        });

        // Verification Fixes
        // If we somehow missed a GK (very unlikely given the wishlist priority), force swap the lowest rated card for a GK
        if (!coveredPositions.has('GK')) {
            // Find a GK from any pool (preferably low tier)
            const gk = ALL_PLAYERS.find(p => p.position === 'GK' && !addedPlayerIds.has(p.id) && p.overallRating <= 87 && p.overallRating >= 49);
            if (gk) {
                // Remove the last card (likely bronze/silver)
                const removed = pack.pop();
                addedPlayerIds.delete(removed.id);

                pack.push(gk);
                addedPlayerIds.add(gk.id);
            }
        }

        const cardIds = [];
        for (const player of pack) {
            const card = dbRequest.createCard(userId, player.id);
            cardIds.push(card.id);
        }
        return cardIds;
    },

    // Grant daily pack (3 random players)
    grantDailyPack: (userId) => {
        const pack = [];
        for (let i = 0; i < 3; i++) {
            pack.push(ALL_PLAYERS[Math.floor(Math.random() * ALL_PLAYERS.length)]);
        }

        const newCards = [];
        for (const player of pack) {
            const card = dbRequest.createCard(userId, player.id);
            newCards.push(card);
        }
        return newCards;
    },

    // Ante Logic: Transfer random card from loser to winner
    processAnte: (winnerId, loserId, loserTeamCardIds) => {
        // Pick a random card from the loser's active team
        if (!loserTeamCardIds || loserTeamCardIds.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * loserTeamCardIds.length);
        const cardIdToTransfer = loserTeamCardIds[randomIndex];

        // Transfer ownership
        dbRequest.transferCard(cardIdToTransfer, winnerId);

        return cardIdToTransfer;
    },

    // Get all user teams with full hydration
    getAllUserTeams: (userId) => {
        const teams = dbRequest.getAllUserTeams(userId);
        if (!teams || teams.length === 0) return [];

        return teams.map(teamData => {
            // Hydrate players from card IDs
            const hydratedPlayers = teamData.card_ids.map(cardId => {
                if (!cardId) return null; // Handle nulls (empty slots)

                const card = dbRequest.getCardById(cardId);
                if (!card) return null;

                const player = ALL_PLAYERS.find(p => p.id === card.player_id);
                // Return basic card if player not found in EA DB, but prefer finding it
                if (!player) return { id: card.id, player_id: card.player_id, name: 'Unknown Player', position: '??' };

                return {
                    ...player,
                    imageUrl: player.imageUrl,
                    id: card.id,
                    playerId: player.id,
                    gainedAt: card.gained_at,
                    attributes: {
                        power: player.power,
                        shoot: player.shoot,
                        pass: player.pass,
                        tackle: player.tackle
                    }
                };
            }); // .filter(p => p !== null); // ALLOW NULLS FOR SPARSE TEAMS

            // Use Team class helper
            const teamHelper = new Team('user_team_' + teamData.id, {
                name: teamData.name,
                formation: teamData.formation,
                players: hydratedPlayers
            });

            return {
                ...teamData,
                formation: teamHelper.formation,
                players: teamHelper.players,
                captain_id: teamData.captain_id,
                kit_numbers: teamData.kit_numbers
            };
        });
    },

    // Get user collection with safety checks
    getUserCollection: (userId) => {
        const cards = dbRequest.getUserCards(userId);
        return cards.map(card => {
            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) {
                // Fallback for missing player data
                return {
                    id: card.id,
                    playerId: card.player_id,
                    name: 'Unknown Player',
                    position: '??',
                    overallRating: 0,
                    imageUrl: null,
                    gainedAt: card.gained_at
                };
            }

            return {
                ...player,
                imageUrl: player.imageUrl,
                id: card.id,
                playerId: player.id,
                gainedAt: card.gained_at
            };
        });
    },

    // Get user's active team with full hydration
    getUserTeam: (userId) => {
        const teamData = dbRequest.getUserTeam(userId);
        if (!teamData) return null;

        // Hydrate players from card IDs
        const hydratedPlayers = teamData.card_ids.map(cardId => {
            if (!cardId) return null;

            const card = dbRequest.getCardById(cardId);
            if (!card) return null;

            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) return card;

            return {
                ...player,
                imageUrl: player.imageUrl,
                id: card.id,
                playerId: player.id,
                gainedAt: card.gained_at,
                // Add attributes object for Team -> Player class compatibility
                attributes: {
                    power: player.power,
                    shoot: player.shoot,
                    pass: player.pass,
                    tackle: player.tackle
                }
            };
        }); // .filter(p => p !== null);

        // Use Team class to ensure consistent slot assignment
        const teamHelper = new Team('user_team', {
            name: teamData.name,
            formation: teamData.formation,
            players: hydratedPlayers
        });

        return {
            ...teamData,
            formation: teamHelper.formation,
            players: teamHelper.players, // Players now have assignedPos/Slot
            captain_id: teamData.captain_id,
            kit_numbers: teamData.kit_numbers
        };
    },

    // Get a specific team by ID with full hydration
    getTeamById: (teamId) => {
        const team = dbRequest.getTeamById(teamId);
        if (!team) return null;

        // Hydrate players from card IDs
        const hydratedPlayers = team.card_ids.map(cardId => {
            if (!cardId) return null;

            const card = dbRequest.getCardById(cardId);
            if (!card) return null;

            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) return card;

            return {
                ...player,
                imageUrl: player.imageUrl,
                id: card.id,
                playerId: player.id,
                gainedAt: card.gained_at,
                // Add attributes for game engine compatibility
                attributes: {
                    power: player.power,
                    shoot: player.shoot,
                    pass: player.pass,
                    tackle: player.tackle
                }
            };
        }); // .filter(p => p !== null);

        return {
            id: team.id,
            name: team.name,
            formation: team.formation,
            card_ids: team.card_ids,
            players: hydratedPlayers,
            captain_id: team.captain_id,
            kit_numbers: team.kit_numbers,
            coach_id: team.coach_id
        };
    },

    // Pack Shop: Buy a pack with coins
    buyPack: (userId, packType) => {
        const packConfig = {
            bronze: { cost: 300000, count: 4, minRating: 45, guaranteeRate: 0, guaranteeCount: 0 },
            silver: { cost: 500000, count: 6, minRating: 65, guaranteeRate: 75, guaranteeCount: 1 },
            gold: { cost: 750000, count: 8, minRating: 75, guaranteeRate: 83, guaranteeCount: 1 }
        };

        const pack = packConfig[packType];
        if (!pack) return { success: false, error: 'Invalid pack type' };

        // Check user coins
        const currentCoins = dbRequest.getUserCoins(userId);
        if (currentCoins < pack.cost) {
            return { success: false, error: 'Not enough coins' };
        }

        // Deduct coins
        dbRequest.updateUserCoins(userId, currentCoins - pack.cost);

        // Grant cards
        const newCards = [];

        // Helper to get random player with constraints
        const getPlayer = (minR = 0) => {
            // Filter eligible players
            const pool = ALL_PLAYERS.filter(p => (p.overallRating || 0) >= minR);
            // Fallback to all players if pool is empty (shouldn't happen with reasonable data)
            const finalPool = pool.length > 0 ? pool : ALL_PLAYERS;
            return finalPool[Math.floor(Math.random() * finalPool.length)];
        };

        // 1. Add Guaranteed High Rating Cards
        for (let i = 0; i < pack.guaranteeCount; i++) {
            const player = getPlayer(pack.guaranteeRate);
            const card = dbRequest.createCard(userId, player.id);
            newCards.push({ ...card, player });
        }

        // 2. Fill the rest with standard pack minimums
        const remaining = pack.count - pack.guaranteeCount;
        for (let i = 0; i < remaining; i++) {
            const player = getPlayer(pack.minRating);
            const card = dbRequest.createCard(userId, player.id);
            newCards.push({ ...card, player });
        }

        return {
            success: true,
            cards: newCards,
            newBalance: currentCoins - pack.cost
        };
    },

    // Subscribe/Buy Specific Player
    buyPlayer: (userId, playerId) => {
        // 1. Find Player
        const player = ALL_PLAYERS.find(p => p.id === playerId);
        if (!player) return { success: false, error: 'Player not found' };

        // 2. Calculate Price (Use Buy Price directly)
        const buyPrice = calculateBuyPrice(player.overallRating || 0);

        // 3. Check Balance
        const currentCoins = dbRequest.getUserCoins(userId);
        if (currentCoins < buyPrice) {
            return { success: false, error: `Not enough coins. Need ${buyPrice}` };
        }

        // 4. Deduct Coins
        dbRequest.updateUserCoins(userId, currentCoins - buyPrice);

        // 5. Grant Card
        const card = dbRequest.createCard(userId, player.id);

        return {
            success: true,
            message: `Bought ${player.name} for ${buyPrice} coins`,
            newBalance: currentCoins - buyPrice,
            card: { ...card, player }
        };
    },

    // Search Players with multiple filters
    searchPlayers: (filters) => {
        // Backward compatibility: if filters is a string, treat as name search
        if (typeof filters === 'string') {
            filters = { name: filters };
        }

        // If no filters or empty object, return empty
        if (!filters || Object.keys(filters).length === 0) return [];

        // Helper function to get rating range for card type
        const getRatingRange = (type) => {
            switch (type?.toLowerCase()) {
                case 'bronze': return { min: 0, max: 69 };
                case 'silver': return { min: 70, max: 79 };
                case 'gold': return { min: 80, max: 89 };
                case 'special': return { min: 90, max: 100 };
                default: return null;
            }
        };

        // Start with all players
        let matches = ALL_PLAYERS;

        // Apply name filter (substring match, case-insensitive)
        if (filters.name && filters.name.length >= 2) {
            const lowerName = filters.name.toLowerCase();
            matches = matches.filter(p => p.name.toLowerCase().includes(lowerName));
        }

        // Apply nationality filter (exact match, case-insensitive)
        if (filters.nationality) {
            const lowerNat = filters.nationality.toLowerCase();
            matches = matches.filter(p =>
                p.nationality && p.nationality.toLowerCase() === lowerNat
            );
        }

        // Apply position filter (exact match)
        if (filters.position) {
            matches = matches.filter(p => p.position === filters.position);
        }

        // Apply league filter (exact match, case-insensitive)
        if (filters.league) {
            const lowerLeague = filters.league.toLowerCase();
            matches = matches.filter(p =>
                p.league && p.league.toLowerCase() === lowerLeague
            );
        }

        // Apply team/club filter (substring match, case-insensitive)
        if (filters.team) {
            const lowerTeam = filters.team.toLowerCase();
            matches = matches.filter(p =>
                p.team && p.team.toLowerCase().includes(lowerTeam)
            );
        }

        // Apply type/rarity filter (based on overall rating)
        if (filters.type) {
            const range = getRatingRange(filters.type);
            if (range) {
                matches = matches.filter(p => {
                    const rating = p.overallRating || 0;
                    return rating >= range.min && rating <= range.max;
                });
            }
        }

        // Limit results and add buy price
        return matches.slice(0, 50).map(p => ({
            ...p,
            buyPrice: calculateBuyPrice(p.overallRating || 0)
        }));
    },

    sellCard: (userId, cardId) => {
        // 1. Verify ownership
        const card = dbRequest.getCardById(cardId);
        if (!card) return { success: false, error: 'Card not found' };
        if (card.user_id !== userId) return { success: false, error: 'Unauthorized' };

        // 2. Identify Player and Rating
        const player = ALL_PLAYERS.find(p => p.id === card.player_id);
        if (!player) return { success: false, error: 'Player data not found' };

        // 3. Calculate Price (Sell Price is 1/5th of Buy Price)
        const rating = player.overallRating || 0;
        const buyPrice = calculateBuyPrice(rating);
        const price = Math.floor(buyPrice / 5);

        // 4. Delete Card
        const deleted = dbRequest.deleteCard(cardId, userId);
        if (!deleted) return { success: false, error: 'Failed to delete card' };

        // 5. Add Coins
        const newBalance = dbRequest.addUserCoins(userId, price);

        return {
            success: true,
            soldPrice: price,
            newBalance: newBalance,
            message: `Sold ${player.name} for ${price} coins`
        };
    },

    sellCards: (userId, cardIds) => {
        if (!Array.isArray(cardIds) || cardIds.length === 0) {
            return { success: false, error: 'No cards specified' };
        }

        let totalSoldValue = 0;
        let soldCount = 0;
        const soldCards = [];
        const errors = [];

        // Transaction-like safety would be better, but assuming single-threaded JS execution for now
        // We will process one by one
        for (const cardId of cardIds) {
            // 1. Verify ownership
            const card = dbRequest.getCardById(cardId);
            if (!card) {
                errors.push(`Card ${cardId} not found`);
                continue;
            }
            if (card.user_id !== userId) {
                errors.push(`Card ${cardId} unauthorized`);
                continue;
            }

            // 2. Identify Player and Rating
            const player = ALL_PLAYERS.find(p => p.id === card.player_id);
            if (!player) {
                // If player data missing, use default low value? Or skip?
                // Skip for safety
                errors.push(`Player data missing for card ${cardId}`);
                continue;
            }

            // 3. Calculate Price
            const rating = player.overallRating || 0;
            const buyPrice = calculateBuyPrice(rating);
            const price = Math.floor(buyPrice / 5);

            // 4. Delete Card
            const deleted = dbRequest.deleteCard(cardId, userId);
            if (deleted) {
                totalSoldValue += price;
                soldCount++;
                soldCards.push(cardId);
            } else {
                errors.push(`Failed to delete card ${cardId}`);
            }
        }

        // 5. Add Total Coins
        if (soldCount > 0) {
            const newBalance = dbRequest.addUserCoins(userId, totalSoldValue);
            return {
                success: true,
                soldCount,
                totalValue: totalSoldValue,
                newBalance,
                message: `Sold ${soldCount} players for ${totalSoldValue} coins`,
                errors: errors.length > 0 ? errors : undefined
            };
        } else {
            return {
                success: false,
                error: 'No cards were sold',
                details: errors
            };
        }
    }
};

function getRandomPlayerByPos(pos) {
    const candidates = ALL_PLAYERS.filter(p => p.position === pos);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

export function calculateBuyPrice(rating) {
    if (rating >= 90) return 500000;
    if (rating >= 88) return 450000; // 89-88
    if (rating >= 85) return 400000; // 87-85
    if (rating >= 81) return 375000; // 84-81
    if (rating >= 77) return 350000; // 80-77
    if (rating >= 73) return 325000; // 76-73
    if (rating >= 68) return 300000; // 72-68
    if (rating >= 63) return 275000; // 67-63
    if (rating >= 57) return 250000; // 62-57
    if (rating >= 52) return 225000; // 56-52
    return 200000;                   // 51- (and below)
}
