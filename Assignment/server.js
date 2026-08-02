require("dotenv").config();
const init = require("./db/init");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function start() {
    await init();

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

start();