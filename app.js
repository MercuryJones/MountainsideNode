// app.js
import express from "express";
import cors from "cors";
import Joi from "joi";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Uploads
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

let amenities = [
  { id: 1, title: "Outdoor Kitchen", description: "Outdoor kitchen appliances for all of your grilling dreams.", image: "/images/kitchen.jpg" },
  { id: 2, title: "Jet Ski and Paddle Boards", description: "Have a blast on the lake with our fast jetski!", image: "/images/ski.jpg" },
  { id: 3, title: "Outdoor Fire Pit", description: "A quaint fireplace for s'mores.", image: "/images/fire.jpg" },
  { id: 4, title: "Tanning", description: "Achieve a beautiful bronze.", image: "/images/tan.jpg" },
];

// Schema
const amenitySchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().min(5).required(),
});

// GET amenities
app.get("/api/amenities", (req, res) => res.json(amenities));

// POST new amenity
app.post("/api/amenities", upload.single("image"), (req, res) => {
  const { error } = amenitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  if (!req.file) return res.status(400).json({ error: "Image is required." });

  const newAmenity = {
    id: Date.now(),
    name: req.body.name,
    description: req.body.description,
    image: "/uploads/" + req.file.filename,
  };

  amenities.push(newAmenity);
  res.status(201).json(newAmenity);
});

// PUT update amenity
app.put("/api/amenities/:id", upload.single("image"), (req, res) => {
  const amenity = amenities.find((a) => a.id === parseInt(req.params.id));
  if (!amenity || amenities.indexOf(amenity) < 4) return res.status(404).json({ error: "Amenity not found or cannot be edited." });

  const { error } = amenitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  amenity.name = req.body.name;
  amenity.description = req.body.description;
  if (req.file) amenity.image = "/uploads/" + req.file.filename;

  res.json(amenity);
});

// DELETE amenity
app.delete("/api/amenities/:id", (req, res) => {
  const index = amenities.findIndex((a) => a.id === parseInt(req.params.id));
  if (index === -1 || index < 4) return res.status(404).json({ error: "Amenity not found or cannot be deleted." });

  amenities.splice(index, 1);
  res.sendStatus(200);
});

// Home
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
