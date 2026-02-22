import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbRequest } from './db/repository.js';
import { cardManager } from '../core/cardManager.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

export const auth = {
    // Middleware to verify token
    authenticate: (req, res, next) => {
        // Extract token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // Allow guest/anonymous for now or handle appropriately
            // For APIs that require auth, return 401
            return res.writeHead(401).end(JSON.stringify({ error: 'Unauthorized' }));
        }

        try {
            const user = jwt.verify(token, JWT_SECRET);
            req.user = user;
            return next(); // Proceed
        } catch (err) {
            return res.writeHead(403).end(JSON.stringify({ error: 'Forbidden: Invalid Token' }));
        }
    },

    // Helper for WebSockets
    verifyToken: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return null;
        }
    },

    // Service methods
    register: async (username, password) => {
        // Check if user exists
        const existing = dbRequest.findUserByUsername(username);
        if (existing) {
            throw new Error('Username already taken');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = dbRequest.createUser(username, hash);

        // Set initial coins (2,500,000)
        dbRequest.updateUserCoins(newUser.id, 2500000);

        // Grant starter pack (11 players)
        cardManager.grantStarterPack(newUser.id);

        // Generate token
        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

        return { user: { id: newUser.id, username: newUser.username }, token };
    },

    login: async (username, password) => {
        const user = dbRequest.findUserByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check password
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw new Error('Invalid credentials');
        }

        // Update login time
        dbRequest.updateDailyLogin(user.id);

        // Generate token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        return { user: { id: user.id, username: user.username, last_daily_login: user.last_daily_login }, token };
    }
};
