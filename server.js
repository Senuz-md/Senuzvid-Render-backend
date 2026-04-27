const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("SenuzVid Premium Engine v17 - Multi-Server Sync 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // ලින්ක් එක පිරිසිදු කිරීම (Tracking parameters ඉවත් කරයි)
        url = url.split('?')[0];

        // 1. TIKTOK - TikWM (ඉතාමත් ස්ථාවරයි)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const d = r.data.data;
            if (d) return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
        }

        // 2. FACEBOOK & INSTAGRAM - Multi-Source Fallback
        if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("instagram.com")) {
            
            // Method A: Cobalt (Stable Instance)
            try {
                const cbRes = await axios.post('https://api.cobalt.tools/', {
                    url: url,
                    videoQuality: quality || "720"
                }, { timeout: 8000 });
                if (cbRes.data && cbRes.data.url) return res.redirect(cbRes.data.url);
            } catch (e) { console.log("Method A failed"); }

            // Method B: SnapSave Style API (Alternative)
            try {
                const snapRes = await axios.get(`https://api.boxvids.com/api/info?url=${encodeURIComponent(url)}`);
                if (snapRes.data && snapRes.data.url) return res.redirect(snapRes.data.url);
            } catch (e) { console.log("Method B failed"); }

            // Method C: Third-party Downloader Engine
            try {
                const vkrAlternative = await axios.get(`https://api.socialdownloader.xyz/api/facebook?url=${encodeURIComponent(url)}`);
                if (vkrAlternative.data && vkrAlternative.data.result) {
                    const links = vkrAlternative.data.result;
                    return res.redirect(quality === "1080" ? (links.hd || links.sd) : links.sd);
                }
            } catch (e) { console.log("Method C failed"); }
        }

        // 3. YOUTUBE & OTHERS (Using Unblockit Instance)
        const finalRes = await axios.post('https://cobalt.api.unblockit.win/', {
            url: url,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264"
        }, {
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            timeout: 15000
        });

        if (finalRes.data && finalRes.data.url) {
            return res.redirect(finalRes.data.url);
        }

        throw new Error("සියලුම සර්වර් උත්සාහයන් අසාර්ථක විය.");

    } catch (e) {
        console.error("LOG:", e.message);
        res.status(500).json({ 
            error: "බාගත කිරීම අසාර්ථකයි.", 
            details: "සර්වර් එකේ ගැටලුවක් පවතී. පසුව උත්සාහ කරන්න.",
            debug: e.message
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
        return res.json({ platform: "Video", title: "Video Found", thumbnail: "https://files.catbox.moe/1dlcmm.jpg" });
    } catch (e) { res.json({ error: "Details Fetch Error" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Final Pro Engine on port ${PORT}`));
