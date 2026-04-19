import { Request, Response } from 'express';
import User from '../models/User.js';

// Creation of user account
// POST
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email } = req.body;

        // Checks if email/username already exist
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            res.status(409).json({ message: 'Username or email already in use.' }); // 409: conflict error
            return;
        }

        // Email/username does not exist yet
        const user = await User.create({ username, email });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create user.', error: (err as Error).message });
    }
};

// Retrieve profile
// GET
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id)
            .populate('following', 'username')
            .populate('followers', 'username');

        if (!user) {
            res.status(404).json({ message: 'User not found.' }); // 404: Not found
            return;
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user.', error: (err as Error).message });
    }
};