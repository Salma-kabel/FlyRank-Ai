const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
let lastRequestTime = 0;
const BOOK_URL =
    "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html";

const CACHE_DIR = path.join(__dirname, "..", "cache", "books");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getCacheFile(url) {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").filter(Boolean).slice(-2, -1)[0];

    return path.join(CACHE_DIR, `${filename}.html`);
}

function extractTitle(html) {
    const $ = cheerio.load(html);

    return $(".product_main h1").text().trim();
}

function extractPrice(html) {
    const $ = cheerio.load(html);

    return $(".product_main .price_color").first().text().trim();
}

function extractAvailability(html) {
    const $ = cheerio.load(html);

    return $(".product_main .availability").text().trim();
}

function extractRating(html) {
    const $ = cheerio.load(html);

    const className = $(".product_main .star-rating").attr("class") || "";

    return (
        className
            .split(/\s+/)
            .find((name) => name !== "star-rating") || null
    );
}

function extractDescription(html) {
    const $ = cheerio.load(html);

    const description = $("#product_description + p").text().trim();

    return description || null;
}

function extractBookRecord(html, productUrl, sourcePage) {
    return {
        title: extractTitle(html),
        product_url: productUrl,
        price_text: extractPrice(html),
        availability_text: extractAvailability(html),
        rating_text: extractRating(html),
        description: extractDescription(html),
        source_page: sourcePage,
        fetched_at: new Date().toISOString()
    };
}

function getCacheFile(url) {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").filter(Boolean).slice(-2, -1)[0];

    return path.join(CACHE_DIR, `${filename}.html`);
}

async function fetchBookPage(url) {
    const cacheFile = getCacheFile(url);

    if (fs.existsSync(cacheFile)) {
        const html = fs.readFileSync(cacheFile, "utf-8");

        console.log(`CACHE HIT`);

        return html;
    }

    const elapsed = Date.now() - lastRequestTime;

    if (lastRequestTime !== 0 && elapsed < 500) {
        await sleep(500 - elapsed);
    }

    lastRequestTime = Date.now();
    console.log(`FETCH ${url}`);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 5000);

    try {
        const response = await fetch(url, {
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

module.exports = {
    fetchBookPage,
    extractBookRecord
};