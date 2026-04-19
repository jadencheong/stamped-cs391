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

// Editing user email and username
// PUT
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const allowedUpdates = ['username', 'email'];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
        );

        if (updates.username) {
            const existingUsername = await User.findOne({ username: updates.username });
            if (existingUsername) {
                res.status(409).json({ message: 'Username already in use.' });
                return;
            }
        }

        if (updates.email) {
            const existingEmail = await User.findOne({ email: updates.email });
            if (existingEmail) {
                res.status(409).json({ message: 'Email already in use.' });
                return;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user.', error: (err as Error).message });
    }
};

// DELETE
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user.', error: (err as Error).message });
    }
};

// Retrieve followers
// GET
export const getFollowers = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).populate('followers', 'username email');
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json(user.followers);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch followers.', error: (err as Error).message });
    }
};

// Retrieve following
// GET
export const getFollowing = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).populate('following', 'username email');
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.status(200).json(user.following);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch following.', error: (err as Error).message });
    }
};