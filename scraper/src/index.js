const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const {
    fetchBookPage,
    extractBookRecord
} = require("./books");

const START_URL = "https://books.toscrape.com/catalogue/page-1.html";

const CACHE_DIR = path.join(__dirname, "..", "cache");

let lastRequestTime = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(pageUrl) {
    const pageName = path.basename(new URL(pageUrl).pathname);

    const cacheFile = path.join(CACHE_DIR, pageName);

    if (fs.existsSync(cacheFile)) {
        const html = fs.readFileSync(cacheFile, "utf-8");

        console.log(`CACHE HIT`);
        return html;
    }

    const elapsed = Date.now() - lastRequestTime;

    if (lastRequestTime !== 0 && elapsed < 500) {
        await sleep(500 - elapsed);
    }

    console.log("FETCH");

    lastRequestTime = Date.now();

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 5000);

    try {
        const response = await fetch(pageUrl, {
            headers: {
                "User-Agent":
                    "FlyRankInternship-A9/1.0 (https://github.com/Salma-kabel/FlyRank-Ai)"
            },
            signal: controller.signal
        });

        if (response.status !== 200) {
            throw new Error(`Fetch failed with status ${response.status}`);
        }

        const html = await response.text();

        fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, html);

        console.log(`FETCH`);

        return html;
    } finally {
        clearTimeout(timeout);
    }
}

async function discoverBooks() {
    let currentUrl = START_URL;

    const allBooks = [];
    let cataloguePages = 0;

    while (cataloguePages < 3) {
        const html = await fetchPage(currentUrl);

        const $ = cheerio.load(html);

        $("article.product_pod h3 a").each((index, element) => {
            const href = $(element).attr("href");

            const absoluteUrl = new URL(href, currentUrl).href;

            allBooks.push({
            url: absoluteUrl,
            sourcePage: currentUrl
            });
        });

        cataloguePages++;

        console.log(`catalogue page ${cataloguePages}: ${currentUrl}`);

        const nextHref = $("li.next a").attr("href");

        if (!nextHref) {
            break;
        }

        currentUrl = new URL(nextHref, currentUrl).href;
    }

    const uniqueBooks = [
    ...new Map(
        allBooks.map(book => [book.url, book])
    ).values()
];

    console.log(`catalogue_pages=${cataloguePages}`);
    console.log(`discovered=${allBooks.length}`);
    console.log(`unique_urls=${uniqueBooks.length}`);

    return  uniqueBooks;
}


async function scrapeBooks(books) {
    const records = [];

    for (const book of books) {
        try {
            const html = await fetchBookPage(book.url);

            const record = extractBookRecord(
                html,
                book.url,
                book.sourcePage
            );

            records.push(record);

            console.log(`SCRAPED ${records.length}/${books.length}`);
        } catch (err) {
            console.error(`FAILED ${book.url}: ${err.message}`);
        }
    }

    if (records.length > 0) {
        console.log("FIRST RAW RECORD:");
        console.log(records[0]);
    }

    return records;
}

async function main() {
    const books = await discoverBooks();

    const records = await scrapeBooks(books);

    console.log(`detail_pages=${records.length}`);
}

main().catch((err) => {
    console.error("ERROR:", err.message);
    process.exit(1);
});