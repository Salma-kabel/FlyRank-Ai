const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

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

        console.log(`CACHE HIT ${html.length} bytes`);
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

        console.log(`FETCH ${html.length} bytes`);

        return html;
    } finally {
        clearTimeout(timeout);
    }
}

async function discoverBooks() {
    let currentUrl = START_URL;

    const allBookLinks = [];
    let cataloguePages = 0;

    while (cataloguePages < 3) {
        const html = await fetchPage(currentUrl);

        const $ = cheerio.load(html);

        $("article.product_pod h3 a").each((index, element) => {
            const href = $(element).attr("href");

            const absoluteUrl = new URL(href, currentUrl).href;

            allBookLinks.push(absoluteUrl);
        });

        cataloguePages++;

        console.log(`catalogue page ${cataloguePages}: ${currentUrl}`);

        const nextHref = $("li.next a").attr("href");

        if (!nextHref) {
            break;
        }

        currentUrl = new URL(nextHref, currentUrl).href;
    }

    const uniqueBookLinks = [...new Set(allBookLinks)];

    console.log(`catalogue_pages=${cataloguePages}`);
    console.log(`discovered=${allBookLinks.length}`);
    console.log(`unique_urls=${uniqueBookLinks.length}`);
}

discoverBooks().catch((err) => {
    console.error("ERROR:", err.message);
    process.exit(1);
});