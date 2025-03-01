import { validateEmail, validatePassword, } from '../utils/validationFunctions.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModel.js';
import { NO_JWT_SECRET } from 'src/constants/errors.js';
const signupRoutes = express.Router();
signupRoutes.get('/:email', async (req, res) => {
    const { email } = req.params;
    try {
        if (email.length < 1)
            return res.status(401).send('Invalid');
        if (!validateEmail(email))
            return res.status(401).send('Invalid Email');
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (user)
            return res.status(200).send('email already taken');
        return res.status(200).send('Available');
    }
    catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
signupRoutes.post('/', async (req, res) => {
    const { name, email, password, profilePicUrl, role } = req.body.user;
    if (!validateEmail(email))
        return res.status(401).json({ error: 'Invalid Email' });
    if (!validatePassword(password))
        return res.status(401).json({ error: 'Invalid Password' });
    try {
        let user;
        user = await UserModel.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(401).json({ error: 'User already exists' });
        }
        user = new UserModel({
            name,
            email: email.toLowerCase(),
            password,
            profilePicUrl,
            role,
        });
        user.password = await bcrypt.hash(password, 12);
        await user.save();
        if (!process.env.jwtSecret) {
            console.error(NO_JWT_SECRET);
            throw new Error('Something is went wrong');
        }
        const payload = { userId: user._id };
        jwt.sign(payload, process.env.jwtSecret, { expiresIn: '14d' }, (err, token) => {
            if (err)
                throw err;
            res.status(200).json(token);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});
export default signupRoutes;
//# sourceMappingURL=signup.js.map