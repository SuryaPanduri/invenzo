const db = require('../db');
const bcrypt = require('bcrypt');

exports.signup = async(req,res) => {
    const{name,email,password} = req.body;

    try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?',[email]);
            if(existing.length>0)
            {
                return res.status(400).json({message:'User already exists..'});
            }
            const hashedPassword = await bcrypt.hash(password,10);
            await db.query('INSERT INTO users (name, email, password) VALUES(?,?,?)',[name,email,hashedPassword]);
            res.status(201).json({message: 'User created successfully..'});
        }
    catch (err) 
        {
            console.error(err);
            res.status(500).json({message:'Server Error..'});
        }
};

const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Compare hashed passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};