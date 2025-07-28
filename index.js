const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "./links.json";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Load links
let links = fs.existsSync(DATA_FILE) ? fs.readJsonSync(DATA_FILE) : {};

// Admin Panel
app.get("/admin", (req, res) => {
  res.render("admin", { links });
});

// Add Redirect
app.post("/add", async (req, res) => {
  const { code, url } = req.body;
  if (!code || !url) return res.status(400).send("Missing code or URL");

  links[code] = url;
  await fs.writeJson(DATA_FILE, links, { spaces: 2 });

  res.redirect("/admin");
});

// Handle Redirect
app.get("/goto/:code", (req, res) => {
  const code = req.params.code;
  const target = links[code];
  if (target) {
    res.redirect(target);
  } else {
    res.status(404).send("Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
