const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));

const OUTPUT_DIR = '/tmp/output';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

app.post('/render', (req, res) => {
  try {
    const { title, audio_url, image_url, duration } = req.body;
    const outputFile = path.join(OUTPUT_DIR, `video_${Date.now()}.mp4`);

    const cmd = `ffmpeg -loop 1 -i "${image_url}" -i "${audio_url}" -c:v libx264 -c:a aac -b:a 192k -shortest -pix_fmt yuv420p -vf "scale=1920:1080" "${outputFile}"`;

    execSync(cmd, { timeout: 300000 });

    res.json({
      success: true,
      video_path: outputFile,
      status: "RENDER_COMPLETE"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', ffmpeg: 'ready' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FFmpeg server running on port ${PORT}`);
});
