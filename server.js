// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { sql, pool, poolConnect } from "./db.js";

const app = express();

// ✅ CORS setup: Allow frontend (Vercel) URL
app.use(cors({
  origin: ["https://resume-vault-tau.vercel.app"], // 👈 apna frontend URL
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// ✅ Resume submission
app.post("/submitForm", async (req, res) => {
  await poolConnect;
  const { name, phone, email, education, skills, experience } = req.body;

  try {
    const request = pool.request();
    request.input("name", sql.VarChar, name);
    request.input("phone", sql.VarChar, phone);
    request.input("email", sql.VarChar, email);
    request.input("education", sql.VarChar, education);
    request.input("skills", sql.VarChar(sql.MAX), skills);
    request.input("experience", sql.Int, experience ? parseInt(experience) : null);

    await request.query(`
      INSERT INTO Users (name, phone, email, education, skills, experience)
      VALUES (@name, @phone, @email, @education, @skills, @experience)
    `);

    res.json({ message: "✅ Resume saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving data:", err);
    res.status(500).json({ message: "Error saving data!" });
  }
});

// ✅ Resume search
app.get("/search", async (req, res) => {
  await poolConnect;
  const { q } = req.query;

  try {
    const request = pool.request();
    request.input("keyword", sql.VarChar, `%${q}%`);

    const result = await request.query(`
      SELECT * FROM Users
      WHERE name LIKE @keyword OR skills LIKE @keyword OR education LIKE @keyword
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching data:", err);
    res.status(500).json({ message: "Error fetching data!" });
  }
});

// ✅ Start server (Render PORT support)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
