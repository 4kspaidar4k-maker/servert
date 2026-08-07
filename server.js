const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

// عرض ملفات مجلد web
app.use(express.static(path.join(__dirname, "web")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "web", "index.html"));
});
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// إنشاء Session جديد
let currentSession = uuidv4();

// API لإرجاع QR Code
app.get("/api/qr", async (req, res) => {
    try {

        const qrData = JSON.stringify({
            session: currentSession
        });

        const qr = await QRCode.toDataURL(qrData);

        res.json({
            success: true,
            session: currentSession,
            qr: qr
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: "QR Error"
        });

    }
});

// اتصال Socket.IO
io.on("connection", (socket) => {

    console.log("✅ Client Connected:", socket.id);

    socket.emit("session", currentSession);

    socket.on("disconnect", () => {

        console.log("❌ Client Disconnected:", socket.id);

    });

});

const PORT = 3000;

server.listen(PORT, () => {

    console.log("====================================");
    console.log("🚀 PhoneControl Server Started");
    console.log(`🌍 http://localhost:${PORT}`);
    console.log(`📷 http://localhost:${PORT}/api/qr`);
    console.log("====================================");

});