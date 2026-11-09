
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(
    "mongodb://127.0.0.1:27017/interiorDecorDB"
)
.then(() => {
    console.log("MongoDB Connected Successfully");
})
.catch(error => {
    console.log("MongoDB Connection Error:", error.message);
});

// Create Customer Schema
const customerSchema = new mongoose.Schema({

    name: String,
    password: String,
    age: Number,
    mobile: String,
    email: String,
    gender: String,
    state: String,
    skills: [String]

});

// Create Customer Model
const Customer = mongoose.model(
    "Customer",
    customerSchema
);

// Display Registration Form
app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "home.html")
    );

});

// Handle Form Submission
app.post("/server", async (req, res) => {

    try {

        const {
            name,
            password,
            age,
            mobile,
            email,
            gender,
            state
        } = req.body;

        // Validate customer details
        if (
            !name ||
            !password ||
            !age ||
            !mobile ||
            !email ||
            !gender ||
            !state
        ) {
            return res.status(400).send("All required fields must be filled.");
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).send("Invalid mobile number.");
        }

        // Securely hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Customer Object
        const customer = new Customer({

            name: name,
            password: hashedPassword,
            age: Number(age),
            mobile: mobile,
            email: email,
            gender: gender,
            state: state,
            skills: Array.isArray(req.body.skills)
                ? req.body.skills
                : req.body.skills
                    ? [req.body.skills]
                    : []

        });

        // Save details in MongoDB
        await customer.save();

        // Retrieve Customer Details
        const customers = await Customer.find();

        // Create HTML table rows
        const rows = customers.map(c => `

            <tr>
                <td>${escapeHTML(c.name)}</td>
                <td>${c.age}</td>
                <td>${escapeHTML(c.mobile)}</td>
                <td>${escapeHTML(c.email)}</td>
                <td>${escapeHTML(c.gender)}</td>
                <td>${escapeHTML(c.state)}</td>
                <td>${escapeHTML((c.skills || []).join(", "))}</td>
            </tr>

        `).join("");

        // Display Customer Details
        res.send(`

            <!DOCTYPE html>
            <html>

            <head>

                <title>Customer Details</title>

                <style>

                    body {
                        font-family: Arial;
                        background: #f5eee5;
                        padding: 25px;
                    }

                    h1 {
                        text-align: center;
                        color: #70452c;
                    }

                    table {
                        width: 100%;
                        background: white;
                        border-collapse: collapse;
                    }

                    th, td {
                        border: 1px solid #999;
                        padding: 12px;
                        text-align: left;
                    }

                    th {
                        background: #805333;
                        color: white;
                    }

                    a {
                        color: #70452c;
                    }

                </style>

            </head>

            <body>

                <h1>INTERIOR E-DECOR SHOP</h1>

                <h2>Customer Submitted Details</h2>

                <p>
                    Customer details stored successfully!
                </p>

                <table>

                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Gender</th>
                        <th>State</th>
                        <th>Decor Preferences</th>
                    </tr>

                    ${rows}

                </table>

                <br>

                <a href="/">Back to Registration</a>

            </body>

            </html>

        `);

    } catch (error) {

        console.log(error);

        res.status(500).send(
            "Error storing customer details"
        );

    }

});

// Escape HTML special characters
function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );

}

// Start Server
app.listen(6000, () => {

    console.log(
        "Server running at http://localhost:6000"
    );

});
