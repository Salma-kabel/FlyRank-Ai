<h1 align="center">Polite Scraper</h1>

## Target Classification

### Target

Books to Scrape

### Why this target?

Books to Scrape is a public practice sandbox designed for
learning and testing web scraping.

### Scope

This scraper will process only the first three catalogue pages
and discover the 60 books listed on those pages.

### Data collected

For each book, the scraper will collect:

- title
- product URL
- price
- availability
- rating
- description
- source catalogue page
- fetch timestamp

### robots.txt

I checked:

https://books.toscrape.com/robots.txt

The request returned `404 Not Found`, so no robots file was found.

A missing robots.txt file is not treated as blanket permission
to scrape.

### Responsible use

This project targets Books to Scrape because it is specifically
provided as a practice sandbox for scraping.

I will not reuse this code on another site without checking its
rules and terms first.