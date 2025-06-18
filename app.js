const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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

// GET: API overview
app.get("/", (req, res) => {
  res.send(
    `<h1>Mountainside API</h1>
     <ul>
       <li><a href="/api/amenities">/api/amenities</a></li>
     </ul>`
  );
});

// GET: All amenities
app.get("/api/amenities", (req, res) => {
  res.json(amenities);
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
