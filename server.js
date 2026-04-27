const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Pro Engine v25 - Internal Core Active 🚀"));

app.get("/api/download", async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).send("URL missing");

    // yt-dlp පාවිච්චි කරලා සෘජුවම වීඩියෝ ලින්ක් එක සර්වර් එකේදිම හදනවා
    // මෙය අනුන්ගේ API මත රඳා නොපවතින නිසා 400 error එන්නේ නැහැ.
    let format = "bestvideo+bestaudio/best";
    if (quality === "audio") format = "bestaudio/best";

    // yt-dlp විධානය (Command)
    // -g යනු ලින්ක් එක පෙන්වන්න (Get URL)
    const command = `yt-dlp -g -f "${format}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: "වීඩියෝව සකස් කිරීමට නොහැකි විය.", debug: stderr });
        }
        
        // Output එකේ එන පළමු ලින්ක් එකට redirect කරයි
        const links = stdout.trim().split('\n');
        const finalLink = links[0];
        
        if (finalLink) {
            return res.redirect(finalLink);
        } else {
            res.status(500).json({ error: "ලින්ක් එක සොයාගත නොහැකි විය." });
        }
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Internal Core running on port ${PORT}`));
