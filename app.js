// app.js
import express from "express";
import cors from "cors";
import multer from "multer";
import Joi from "joi";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

// In-memory data store
let amenities = [
  { id: 1, title: "Outdoor Kitchen", description: "Outdoor Kitchen appliances for all of your grilling dreams.", image: "/images/kitchen.jpg" },
  { id: 2, title: "Jet Ski and Paddle Boards", description: "Have a blast on the lake from fast action jetskis to relaxing paddleboards.", image: "/images/ski.jpg" },
  { id: 3, title: "Outdoor Fire Pit", description: "A quaint fireplace where you and your loved ones can enjoy conversation and s'mores", image: "/images/fire.jpg" },
  { id: 4, title: "Tanning", description: "Achieve a beautiful bronze from our multiple tanning deck options.", image: "/images/tan.jpg" },
];

let currentId = 5;

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Validation schema
const amenitySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

// Root route
app.get("/", (req, res) => {
  res.send(`
    <h1>Mountainside Node API</h1>
    <ul>
      <li><a href="/api/amenities">GET /api/amenities</a></li>
    </ul>
  `);
});

// GET all amenities
app.get("/api/amenities", (req, res) => {
  res.json(amenities);
});

// POST new amenity
app.post("/api/amenities", upload.single("image"), (req, res) => {
  const { error } = amenitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const newAmenity = {
    id: currentId++,
    name: req.body.name,
    description: req.body.description,
    image: req.file ? `/images/${req.file.filename}` : "",
  };

  amenities.push(newAmenity);
  res.status(201).json(newAmenity);
});

// PUT update amenity
app.put("/api/amenities/:id", upload.single("image"), (req, res) => {
  const id = parseInt(req.params.id);
  const amenity = amenities.find((a) => a.id === id);

  if (!amenity) return res.status(404).json({ error: "Amenity not found" });
  const { name, description } = req.body;
  if (!name || !description) return res.status(400).json({ error: "Name and description are required" });

  amenity.name = name;
  amenity.description = description;
  if (req.file) {
    amenity.image = `/images/${req.file.filename}`;
  }

  res.json(amenity);
});

// DELETE amenity
app.delete("/api/amenities/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = amenities.findIndex((a) => a.id === id);

  if (index === -1) return res.status(404).json({ error: "Amenity not found" });

  amenities.splice(index, 1);
  res.sendStatus(200);
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
