// // server.js
// const WebSocket = require('ws');
// const Y = require('yjs');
// const { setupWSConnection } = require('y-websocket/bin/utils');

// const wss = new WebSocket.Server({ 
//     port: 1234,
//     perMessageDeflate: false
// });

// wss.on('connection', (ws, req) => {
//     console.log('✅ New client connected from:', req.socket.remoteAddress);
    
//     // Setup Yjs WebSocket connection
//     setupWSConnection(ws, req);
    
//     ws.on('close', () => {
//         console.log('❌ Client disconnected');
//     });
    
//     ws.on('error', (error) => {
//         console.error('⚠️ WebSocket error:', error.message);
//     });
// });

// console.log('🚀 WebSocket server running on ws://localhost:1234');
// console.log('Press Ctrl+C to stop\n');

// // Handle server shutdown gracefully
// process.on('SIGINT', () => {
//     console.log('\n📦 Shutting down server...');
//     wss.close(() => {
//         console.log('👋 Server closed');
//         process.exit(0);
//     });
// });

// process.on('SIGTERM', () => {
//     console.log('\n📦 Shutting down server...');
//     wss.close(() => {
//         console.log('👋 Server closed');
//         process.exit(0);
//     });
// });