const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

// === Multer setup for image uploads ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// === MongoDB Atlas connection using your personal URI ===
mongoose
  .connect("mongodb+srv://jhatch:vChokxnrwKpW8C2D@cluster0.deogawc.mongodb.net/mountainside?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });

// === Mongoose Schema and Model ===
const amenitySchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
});

const Amenity = mongoose.model("Amenity", amenitySchema);

// === GET all amenities ===
app.get("/api/amenities", async (req, res) => {
  const amenities = await Amenity.find();
  res.send(amenities);
});

// === POST new amenity ===
app.post("/api/amenities", upload.single("image"), async (req, res) => {
  const { name, description } = req.body;

  const result = validateAmenity({ name, description });
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }

  const amenity = new Amenity({
    name,
    description,
    image: req.file?.filename || "",
  });

  const saved = await amenity.save();
  res.send(saved);
});

// === PUT to update amenity ===
app.put("/api/amenities/:id", upload.single("image"), async (req, res) => {
  const { name, description } = req.body;

  const result = validateAmenity({ name, description });
  if (result.error) {
    return res.status(400).send({ error: result.error.details[0].message });
  }

  const updateData = {
    name,
    description,
  };

  if (req.file) {
    updateData.image = req.file.filename;
  }

  const updated = await Amenity.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!updated) {
    return res.status(404).send({ error: "Amenity not found" });
  }

  res.send(updated);
});

// === DELETE amenity ===
app.delete("/api/amenities/:id", async (req, res) => {
  const deleted = await Amenity.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).send({ error: "Amenity not found" });
  }
  res.send(deleted);
});

// === Joi validation ===
const validateAmenity = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
  });

  return schema.validate(data);
};

// === Start server ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
