const express = require('express')
const WebSocket = require('ws');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const path = require('path')

const jwt = require("jsonwebtoken");
const key = "fdlasjfdlsafkljdskjf";
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setting the websocket server
const wss = new WebSocket.Server({ port: 8081 });

// Setting up the database
mongoose.connect('mongodb://localhost:27017/NodeLab5');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posts: [
        {
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
});
const User = mongoose.model('User', userSchema);

app.post('/register', async function(req,res) {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password: await bcrypt.hash(password, 10) });
        await user.save();
        // res.status(201).send('User registered successfully');
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } catch (error) {
            console.error(error); 
            res.status(400).send('Error registering user');
    }
});

app.post('/login', async function(req,res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('You must register first');
        } else if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ username: user }, key);

        // Set the token in an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            maxAge: 7 * 24 * 60 * 60 * 1000 // expires after 1 week
        });

        res.redirect('/home');

    } catch (error) {
        res.status(400).send('Error logging in');
    }
});

const auth = (req, res, next) => {
    const token = req.cookies.token; // Get the token from the cookies
    if (!token) {
        return res.status(401).send({ msg: "Token required" });
    }

    try {
        const decoded = jwt.verify(token, key); // Verify the token
        req.user = decoded; // Attach the decoded token data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        return res.status(401).send({ msg: "Invalid token" });
    }
};

app.get('/home', auth, async (req, res) => {
    const username = req.user.username.username; // Get the username from the decoded token
    try {
        // Find the user and get their posts
        const user = await User.findOne({ username });
        const userPosts = user.posts;

        // Get all users and their posts
        const users = await User.find({});
        const allPosts = users.flatMap(user => 
            user.posts.map(post => ({ username: user.username, content: post.content, createdAt: post.createdAt }))
        );

        res.render('home', { username, userPosts, allPosts }); // Render the EJS template with both userPosts and allPosts
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading user profile');
    }
});

app.post('/addpost', auth, async (req, res) => {
    const username = req.user.username.username; // Get the username from the decoded token
    const { post } = req.body; // Get the new post from the form

    try {
        // Find the user and update their posts array
        await User.findOneAndUpdate(
            { username },
            { $push: { posts: { content: post } } }, // Add the new post to the posts array
            { new: true } // Return the updated document
        );

        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding post');
    }
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.get('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    // Redirect the user to the login page
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(8080);