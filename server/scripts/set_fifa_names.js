/**
 * Script to populate FIFA-style display names for all players
 * Uses common FIFA naming conventions (last name, nickname, or known name)
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../src/data/footstars.db'));

// Known FIFA display names (add more as needed)
const FIFA_NAMES = {
    // Brazilian players use nicknames
    'Raphael Dias Belloli': 'Raphinha',
    'Vítor Machado Ferreira': 'Vitinha',
    'Vinicius de Souza Costa': 'Vinicius',
    'Amaral Alves Marcos Vinicius': 'Vinicius Jr',
    'Robert Vinicius Rodrigues Silva': 'Vinicius',
    'Lázaro Vinicius Marques': 'Lázaro',
    'Rodrygo Silva de Goes': 'Rodrygo',
    'Marcos Aoás Corrêa': 'Marquinhos',
    'Éderson Santana de Moraes': 'Ederson',
    'Alisson Ramses Becker': 'Alisson',
    'Gabriel Fernando de Jesus': 'G. Jesus',
    'Gabriel Teodoro Martinelli Silva': 'Martinelli',
    'Antony Matheus dos Santos': 'Antony',
    'Richarlison de Andrade': 'Richarlison',
    'Casemiro': 'Casemiro',
    'Fabinho': 'Fabinho',
    'Fernandinho': 'Fernandinho',
    'Fred Rodrigues': 'Fred',
    'Neymar da Silva Santos Júnior': 'Neymar Jr',
    'Neymar Jr': 'Neymar Jr',
    'Roberto Firmino Barbosa de Oliveira': 'Firmino',
    'Philippe Coutinho Correia': 'Coutinho',
    'Éder Gabriel Militão': 'Militão',
    'Bremer': 'Bremer',
    'Danilo Luiz da Silva': 'Danilo',
    'Renan Augusto Lodi dos Santos': 'Renan Lodi',
    'Alex Sandro Lobo Silva': 'Alex Sandro',
    'Guilherme Arana Lopes': 'Arana',
    'Wendell Nascimento Borges': 'Wendell',
    'Weverton Pereira da Silva': 'Weverton',
    'Lucas Tolentino Coelho de Lima': 'Lucas Paquetá',
    'Bruno Guimarães Rodriguez Moura': 'Bruno Guimarães',
    'Douglas Luiz Soares de Paulo': 'Douglas Luiz',
    'Matheus Henrique de Souza': 'Matheus Henrique',
    'Everton Ribeiro': 'Everton Ribeiro',
    'Lucas Veríssimo': 'Lucas Veríssimo',
    'Pedro Guilherme Abreu dos Santos': 'Pedro',

    // Spanish players - use both names typically
    'Rodrigo Hernández Cascante': 'Rodri',
    'Pedro González López': 'Pedri',
    'Pablo Martín Páez Gavira': 'Gavi',
    'Lamine Yamal Nasraoui Ebana': 'Lamine Yamal',
    'Alejandro Balde Martínez': 'Alejandro Balde',
    'Marc Cucurella Saseta': 'Cucurella',
    'Ferran Torres García': 'Ferran Torres',
    'Anssumane Fati Vieira': 'Ansu Fati',
    'Francisco Román Alarcón Suárez': 'Isco',
    'Marcos Llorente Moreno': 'Marcos Llorente',
    'Álvaro Borja Morata Martín': 'Morata',
    'Mikel Oyarzabal Ugarte': 'Oyarzabal',
    'Aymeric Laporte': 'Laporte',
    'Unai Simón Mendibil': 'Unai Simón',
    'Dani Olmo Carvajal': 'Dani Olmo',
    'Fabián Ruiz Peña': 'Fabián Ruiz',
    'Daniel Carvajal Ramos': 'Carvajal',
    'José Luis Gayà Peña': 'Gayà',
    'Hugo Guillamón Sanmartín': 'Guillamón',
    'Yeremy Pino Santos': 'Yeremy Pino',
    'Nico Williams Arthuer': 'Nico Williams',

    // Portuguese players
    'Cristiano Ronaldo dos Santos Aveiro': 'Cristiano Ronaldo',
    'Bruno Miguel Borges Fernandes': 'Bruno Fernandes',
    'Bernardo Mota Veiga de Carvalho e Silva': 'Bernardo Silva',
    'Diogo José Teixeira da Silva': 'Diogo Jota',
    'João Félix Sequeira': 'João Félix',
    'Rafael Alexandre da Conceição Leão': 'Rafael Leão',
    'Rúben Santos Gato Alves Dias': 'Rúben Dias',
    'Rúben Diogo da Silva Neves': 'Rúben Neves',
    'Nuno Alexandre Tavares Mendes': 'Nuno Mendes',
    'João Pedro Cavaco Cancelo': 'Cancelo',
    'Gonçalo Inácio': 'Gonçalo Inácio',
    'Pedro António Pereira Gonçalves': 'Pedro Gonçalves',
    'Vitinha': 'Vitinha',

    // French players
    'Kylian Mbappé': 'Mbappé',
    'Kylian Mbappé Lottin': 'Mbappé',
    'Antoine Griezmann': 'Griezmann',
    'Ousmane Dembélé': 'Dembélé',
    'N\'Golo Kanté': 'Kanté',
    'Karim Benzema': 'Benzema',
    'Aurélien Tchouaméni': 'Tchouaméni',
    'Eduardo Camavinga': 'Camavinga',
    'Kingsley Coman': 'Coman',
    'Marcus Thuram': 'Thuram',
    'Randal Kolo Muani': 'Kolo Muani',
    'William Saliba': 'Saliba',
    'Dayot Upamecano': 'Upamecano',
    'Jules Koundé': 'Koundé',
    'Théo Hernández': 'Theo Hernández',
    'Lucas Hernández': 'Lucas Hernández',
    'Benjamin Pavard': 'Pavard',
    'Mike Maignan': 'Maignan',
    'Hugo Lloris': 'Lloris',
    'Christopher Nkunku': 'Nkunku',
    'Olivier Giroud': 'Giroud',

    // English players
    'Jude Bellingham': 'Bellingham',
    'Phil Foden': 'Foden',
    'Bukayo Saka': 'Saka',
    'Marcus Rashford': 'Rashford',
    'Harry Kane': 'Kane',
    'Declan Rice': 'Rice',
    'Trent Alexander-Arnold': 'Alexander-Arnold',
    'Reece James': 'Reece James',
    'Kyle Walker': 'Walker',
    'John Stones': 'Stones',
    'Harry Maguire': 'Maguire',
    'Raheem Sterling': 'Sterling',
    'Jack Grealish': 'Grealish',
    'Mason Mount': 'Mount',
    'James Maddison': 'Maddison',
    'Jordan Pickford': 'Pickford',
    'Ben White': 'Ben White',
    'Kieran Trippier': 'Trippier',
    'Cole Palmer': 'Cole Palmer',

    // German players
    'Joshua Kimmich': 'Kimmich',
    'Jamal Musiala': 'Musiala',
    'Leroy Sané': 'Sané',
    'Serge Gnabry': 'Gnabry',
    'Kai Havertz': 'Havertz',
    'Florian Wirtz': 'Wirtz',
    'Antonio Rüdiger': 'Rüdiger',
    'Niklas Süle': 'Süle',
    'Manuel Neuer': 'Neuer',
    'Marc-André ter Stegen': 'Ter Stegen',
    'Thomas Müller': 'Müller',
    'Ilkay Gündogan': 'Gündogan',
    'Leon Goretzka': 'Goretzka',
    'Toni Kroos': 'Kroos',

    // Italian players
    'Gianluigi Donnarumma': 'Donnarumma',
    'Federico Chiesa': 'Chiesa',
    'Nicolò Barella': 'Barella',
    'Sandro Tonali': 'Tonali',
    'Lorenzo Pellegrini': 'Pellegrini',
    'Alessandro Bastoni': 'Bastoni',
    'Leonardo Bonucci': 'Bonucci',
    'Giorgio Chiellini': 'Chiellini',
    'Ciro Immobile': 'Immobile',
    'Federico Dimarco': 'Dimarco',

    // Argentine players
    'Lionel Messi': 'Messi',
    'Lionel Andrés Messi': 'Messi',
    'Rodrigo De Paul': 'De Paul',
    'Enzo Fernández': 'Enzo Fernández',
    'Julián Álvarez': 'Julián Álvarez',
    'Lautaro Martínez': 'Lautaro Martínez',
    'Ángel Di María': 'Di María',
    'Leandro Paredes': 'Paredes',
    'Paulo Dybala': 'Dybala',
    'Emiliano Martínez': 'E. Martínez',
    'Lisandro Martínez': 'L. Martínez',
    'Cristian Romero': 'Romero',
    'Nahuel Molina': 'Molina',
    'Alexis Mac Allister': 'Mac Allister',
    'Giovani Lo Celso': 'Lo Celso',

    // Dutch players
    'Virgil van Dijk': 'Van Dijk',
    'Frenkie de Jong': 'De Jong',
    'Memphis Depay': 'Memphis',
    'Cody Gakpo': 'Gakpo',
    'Xavi Simons': 'Xavi Simons',
    'Nathan Aké': 'Aké',
    'Matthijs de Ligt': 'De Ligt',
    'Denzel Dumfries': 'Dumfries',
    'Steven Bergwijn': 'Bergwijn',

    // Belgian players
    'Kevin De Bruyne': 'De Bruyne',
    'Romelu Lukaku': 'Lukaku',
    'Thibaut Courtois': 'Courtois',
    'Youri Tielemans': 'Tielemans',
    'Leandro Trossard': 'Trossard',
    'Jérémy Doku': 'Doku',
    'Amadou Onana': 'Onana',

    // Croatian players
    'Luka Modrić': 'Modrić',
    'Mateo Kovačić': 'Kovačić',
    'Ivan Perišić': 'Perišić',
    'Joško Gvardiol': 'Gvardiol',
    'Marcelo Brozović': 'Brozović',

    // Norwegian
    'Erling Haaland': 'Haaland',
    'Martin Ødegaard': 'Ødegaard',

    // Polish
    'Robert Lewandowski': 'Lewandowski',
    'Piotr Zieliński': 'Zieliński',
    'Wojciech Szczęsny': 'Szczęsny',

    // Egyptian
    'Mohamed Salah': 'Salah',

    // Senegalese
    'Sadio Mané': 'Mané',

    // Korean
    'Heung-Min Son': 'Son',
    'Son Heung-min': 'Son',

    // Other notable players
    'Achraf Hakimi': 'Hakimi',
    'Achraf Hakimi Mouh': 'Hakimi',
};

/**
 * Generate a FIFA-style display name from a full name
 */
function generateDisplayName(fullName) {
    // Check if we have a known FIFA name
    if (FIFA_NAMES[fullName]) {
        return FIFA_NAMES[fullName];
    }

    // Handle names that are already short (single word or known format)
    if (!fullName.includes(' ')) {
        return fullName;
    }

    const parts = fullName.split(' ');

    // For Brazilian-style names with many parts, often use a nickname
    // Check if any part is a known nickname pattern
    const brazilianNicknames = ['Junior', 'Jr', 'Júnior', 'Neto', 'Filho'];
    const hasNicknameIndicator = parts.some(p => brazilianNicknames.includes(p));

    // If it's a simple "First Last" format
    if (parts.length === 2) {
        return parts[1]; // Just use last name (FIFA style)
    }

    // If longer than 2 parts
    if (parts.length > 2) {
        // Special handling for common patterns
        // "de", "da", "dos", "van", "von" are typically part of the surname
        const connectors = ['de', 'da', 'das', 'do', 'dos', 'van', 'von', 'der'];

        // Find last name considering connectors
        let lastNameStart = parts.length - 1;
        for (let i = parts.length - 2; i >= 0; i--) {
            if (connectors.includes(parts[i].toLowerCase())) {
                lastNameStart = i;
            } else {
                break;
            }
        }

        // If connector found, use the full surname with connector
        if (lastNameStart < parts.length - 1) {
            return parts.slice(lastNameStart).join(' ');
        }

        // Otherwise just use the last name
        return parts[parts.length - 1];
    }

    return fullName;
}

// Get all players
const players = db.prepare('SELECT ea_player_id, real_name, display_name FROM base_players').all();

console.log(`Processing ${players.length} players...`);

let updated = 0;
let skipped = 0;

for (const player of players) {
    // Skip if already has a display name
    if (player.display_name) {
        skipped++;
        continue;
    }

    const displayName = generateDisplayName(player.real_name);

    // Only update if different from real name
    if (displayName !== player.real_name) {
        db.prepare('UPDATE base_players SET display_name = ? WHERE ea_player_id = ?')
            .run(displayName, player.ea_player_id);
        updated++;

        if (updated <= 50) {
            console.log(`${player.real_name} => ${displayName}`);
        }
    }
}

console.log(`\nDone! Updated ${updated} players, skipped ${skipped} (already had display names)`);
console.log(`${players.length - updated - skipped} players kept their real name`);
