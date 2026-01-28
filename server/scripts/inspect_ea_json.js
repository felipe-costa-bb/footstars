
import * as cheerio from 'cheerio';

const URL = 'https://www.ea.com/games/ea-sports-fc/ratings?page=1';

async function main() {
    try {
        console.log('Fetching:', URL);
        const res = await fetch(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();
        const $ = cheerio.load(html);
        const nextData = $('#__NEXT_DATA__').html();

        if (!nextData) {
            console.error('No __NEXT_DATA__ found');
            return;
        }

        const json = JSON.parse(nextData);

        if (json.props && json.props.pageProps) {
            const props = json.props.pageProps;

            // Inspect ratingDetails
            if (props.ratingDetails) {
                console.log('ratingDetails found');
                if (props.ratingDetails.items && props.ratingDetails.items.length > 0) {
                    console.log('SAMPLE PLAYER:', JSON.stringify(props.ratingDetails.items[0], null, 2));
                } else {
                    console.log('No items in ratingDetails');
                }
            } else {
                console.log('ratingDetails is missing');
            }
        }

    } catch (e) {
        console.error(e);
    }
}

main();
