require("dotenv").config();
const redis = require("./db/redis");
const init = require("./db/init");
const app = require("./app");

const PORT = process.env.PORT || 3000;

async function start() {
    await init();

    await redis.connect();

    const response = await redis.ping();
    console.log(response);
    
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

start();