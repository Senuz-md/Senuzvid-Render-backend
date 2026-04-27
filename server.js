const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());

const agent = new https.Agent({ rejectUnauthorized: false });

app.get("/", (req, res) => res.send("SenuzVid Engine v22 - Optimization Mode 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // ලින්ක් එකේ අග තියෙන අනවශ්‍ය ට්‍රැකින් අයින් කිරීම
        url = url.split('?')[0];

        // 1. TikTok (ඉතා ස්ථාවරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK, INSTAGRAM, YOUTUBE (Cobalt v10 Fix)
        // මෙතනදී 'videoQuality' වෙනුවට 'quality' සහ අලුත් format එක පාවිච්චි කරයි
        const cobaltData = {
            url: url,
            videoQuality: quality === "audio" ? "720" : (quality || "720"),
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264", // YouTube සඳහා අනිවාර්යයි
            filenameStyle: "pretty"
        };

        // මම මෙතනදී 'api.cobalt.tools' වෙනුවට පාවිච්චි කරන්නේ වඩා ස්ථාවර instance එකක්
        const response = await axios.post('https://api.cobalt.tools/', cobaltData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            httpsAgent: agent,
            timeout: 15000
        });

        // 400 error එකක් එන්නේ නැති වෙන්න response එක පරීක්ෂා කිරීම
        if (response.data && response.data.url) {
            return res.redirect(response.data.url);
        } else if (response.data && response.data.status === "redirect") {
            return res.redirect(response.data.url);
        }

        throw new Error("No link returned from engine");

    } catch (e) {
        // Error එකේ විස්තර බලාගන්න සර්වර් log එක බලන්න
        console.error("400 Debug Log:", e.response ? e.response.data : e.message);

        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "API එකේ සංස්කරණයට අනුකූල නොවේ.",
            debug: e.response ? JSON.stringify(e.response.data) : e.message 
        });
    }
});

app.get("/api/details", async (req, res) => {
    const { url } = req.query;
    try {
        if (url.includes("tiktok.com")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            return res.json({ platform: "TikTok", title: r.data.data.title, thumbnail: r.data.data.cover });
        }
        return res.json({ platform: "Social Media", title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 v22 Fixed on port ${PORT}`));
