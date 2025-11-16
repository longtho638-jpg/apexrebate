"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        // Join user to their personal room
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their personal room`);
        }
        // Handle joining admin room
        socket.on('join-admin', () => {
            const userRole = socket.handshake.query.userRole;
            if (userRole === 'ADMIN' || userRole === 'CONCIERGE') {
                socket.join('admin');
                console.log('Admin joined admin room');
            }
        });
        // Handle notifications
        socket.on('send-notification', (notification) => {
            var _a;
            // Broadcast to specific user
            if ((_a = notification.data) === null || _a === void 0 ? void 0 : _a.userId) {
                io.to(`user_${notification.data.userId}`).emit('notification', {
                    ...notification,
                    timestamp: new Date().toISOString(),
                });
            }
            // Broadcast to all admins
            if (notification.type === 'payout' || notification.type === 'referral') {
                io.to('admin').emit('admin-notification', {
                    ...notification,
                    timestamp: new Date().toISOString(),
                });
            }
            // Broadcast system notifications to all
            if (notification.type === 'system') {
                io.emit('notification', {
                    ...notification,
                    timestamp: new Date().toISOString(),
                });
            }
        });
        // Handle payout notifications
        socket.on('payout-processed', (data) => {
            // Send to specific user
            io.to(`user_${data.userId}`).emit('notification', {
                type: 'payout',
                title: 'Thanh toán mới!',
                message: `Bạn đã nhận thanh toán $${data.amount.toFixed(2)} cho kỳ ${data.period} từ ${data.broker}`,
                data,
                timestamp: new Date().toISOString(),
            });
            // Send to admins
            io.to('admin').emit('admin-notification', {
                type: 'payout',
                title: 'Thanh toán đã được xử lý',
                message: `Thanh toán $${data.amount.toFixed(2)} cho user ${data.userId} đã được xử lý`,
                data,
                timestamp: new Date().toISOString(),
            });
        });
        // Handle referral notifications
        socket.on('new-referral', (data) => {
            // Send to referrer
            io.to(`user_${data.referrerId}`).emit('notification', {
                type: 'referral',
                title: 'Người dùng mới!',
                message: `${data.referredUser.name} đã đăng ký bằng mã giới thiệu của bạn`,
                data,
                timestamp: new Date().toISOString(),
            });
            // Send to admins
            io.to('admin').emit('admin-notification', {
                type: 'referral',
                title: 'Lượt giới thiệu mới',
                message: `${data.referredUser.name} (${data.referredUser.email}) đã được giới thiệu bởi ${data.referrerId}`,
                data,
                timestamp: new Date().toISOString(),
            });
        });
        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
        // Send welcome message
        socket.emit('connected', {
            message: 'Connected to ApexRebate notifications',
            timestamp: new Date().toISOString(),
        });
    });
};
exports.setupSocket = setupSocket;
