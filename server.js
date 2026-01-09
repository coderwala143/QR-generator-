import express from "express";
import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * POST /generate-qr-label
 * Body: { "text": "GI19-ADM-LB-FS.FE001" }
 */
app.post("/generate-qr-label", async (req, res) => {
  try {
    const { text } = req.query;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Canvas size (print-friendly)
    const WIDTH = 400;
    const HEIGHT = 400;
    const QR_TOP = 30;
    const QR_SIZE = 250;
    const TEXT_GAP = 10;
    const foldLineY = QR_TOP + QR_SIZE + TEXT_GAP;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Generate QR as data URL
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H", // important for folding
      margin: 1,
      width: 250,
    });

    const qrImage = await loadImage(qrDataUrl);

    // Draw QR (top center)
    ctx.drawImage(qrImage, (WIDTH - QR_SIZE) / 2, QR_TOP, QR_SIZE, QR_SIZE);

    // Small text below QR
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, WIDTH / 2, QR_TOP + QR_SIZE + 40);

    // Fold line
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(20, foldLineY);
    ctx.lineTo(WIDTH - 20, foldLineY);
    ctx.stroke();


    // Send image
    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "QR generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`QR backend running on http://localhost:${PORT}`);
});
