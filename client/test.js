import { io } from "socket.io-client";
const socket = io("https://focus-together-timer.onrender.com");

console.log("Connecting...");
socket.on("connect", () => {
    console.log("Connected to Render backend successfully with id:", socket.id);
    socket.emit("createRoom", { duration: 60 }, (res) => {
        console.log("Room created:", res);
        process.exit(0);
    });
});
socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
});
