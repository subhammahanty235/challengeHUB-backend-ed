require('dotenv').config()
const express = require("express");
const { startMarketingMailConsumer } = require("./marketingmailConsumer");
const { startAuthMailConsumer } = require("./authmailConsumer");

const app = express();
const PORT = process.env.PORT || 3002;

app.get("/test", (req, res) => {
    res.send("Hello, World!");
});

app.get("/", (req, res) => {
    res.send("Hello, World! home");
});
app.get('/health', async (req, res) => {
    console.log("checking heslth ----------> ")
    return res.status(200).send('OK');
})


startAuthMailConsumer()
startMarketingMailConsumer()

app.listen(PORT, () => {
    console.log(` ---------------- Email Server is running on port ${PORT} ----------------`);
});
