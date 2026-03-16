const db = require('../database');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
        
        db.run(query, [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(409).json({ error: "Username already exists" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "User created", user: { id: this.lastID, username } });
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Return user data (in a real app, returning a JWT here would be better)
        res.status(200).json({ message: "Login successful", user: { id: user.id, username: user.username } });
    });
};
