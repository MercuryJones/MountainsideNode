import express from "express";
import cors from "cors";
import Joi from "joi";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Sample data
let amenities = [
    {
      id: 1,
      title: "Outdoor Kitchen",
      description: "Outdoor kitchen appliances for all of your grilling dreams.",
      image: "/images/kitchen.jpg"
    },
    {
      id: 2,
      title: "Jet Ski and Paddle Boards",
      description: "Have a blast on the lake from fast action jetskis to relaxing paddleboards.",
      image: "/images/ski.jpg"
    },
    {
      id: 3,
      title: "Outdoor Fire Pit",
      description: "A quaint fireplace where you and your loved ones can enjoy conversation and s'mores",
      image: "/images/fire.jpg"
    },
    {
      id: 4,
      title: "Tanning",
      description: "Achieve a beautiful bronze from our multiple tanning deck options.",
      image: "/images/tan.jpg"
    }
  ];

// Joi schema
const amenitySchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().min(5).required(),
  image: Joi.string().uri().required()
});

// GET amenities
app.get("/api/amenities", (req, res) => {
  res.json(amenities);
});

// POST amenity
app.post("/api/amenities", (req, res) => {
  const { error } = amenitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const newAmenity = { id: Date.now(), ...req.body };
  amenities.push(newAmenity);
  res.status(201).json(newAmenity);
});

// Simple landing page
app.get("/", (req, res) => {
  res.send(`
    <h1>Mountainside Node API</h1>
    <ul>
      <li><a href="/api/amenities">GET /api/amenities</a></li>
    </ul>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
