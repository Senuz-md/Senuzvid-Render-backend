const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// සර්වර් එක Live ද කියලා බලන්න
app.get("/", (req, res) => res.send("SenuzVid Engine v30 - High Performance Active 🚀"));

app.get("/api/download", async (req, res) => {
    let { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });

    try {
        // Facebook/YouTube ලින්ක් පිරිසිදු කිරීම
        url = url.split('?')[0];

        // TikTok සඳහා (Very Stable)
        if (url.includes("tiktok.com") || url.includes("vm.tiktok")) {
            const r = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            if (r.data.data) {
                const d = r.data.data;
                return res.redirect(quality === "audio" ? d.music : (d.hdplay || d.play));
            }
        }

        // අනෙකුත් සියලුම වීඩියෝ සඳහා (Using Cobalt Fixed API)
        // අපි මෙතනදී කෙලින්ම Cobalt වලට Request එක යවනවා Headers සමඟ
        const response = await axios.post('https://api.cobalt.tools/', {
            url: url,
            videoQuality: quality || "720",
            downloadMode: quality === "audio" ? "audio" : "video",
            youtubeVideoCodec: "h264"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 20000 // $85 සර්වර් එකක් නිසා තත්පර 20ක් ඉන්නවා
        });

        if (response.data && response.data.url) {
            return res.redirect(response.data.url);
        } else {
            throw new Error("No URL returned");
        }

    } catch (e) {
        console.error("Error Detail:", e.message);
        // මෙතනදී Redirect එකක් වෙනුවට JSON Error එකක් යවනවා Frontend එකට හඳුනාගන්න
        res.status(500).json({ 
            error: "සර්වර් එක සමඟ සම්බන්ධ විය නොහැක.", 
            details: "කරුණාකර ලින්ක් එක පරීක්ෂා කර නැවත උත්සාහ කරන්න." 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Engine running on port ${PORT}`));
