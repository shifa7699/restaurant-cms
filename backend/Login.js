require('dotenv').config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const query = require("querystring");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");

// Server and MongoDB setup
const PORT = 8080;
const mongoUrl = process.env.MONGO_URI;
const dbName = "restaurant";
const adminCollection = "check";
const menuCollection = "menu";
const reservationCollection = "reservations";
const usersCollection = "users";

// Multer setup for image uploads
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "restaurant-cms",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });

// Create server
// OPTIONS REQUESTS (for CORS preflight)
 const server = http.createServer(async (req, res) => {

  // Global CORS headers for ALL requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ======= OPTIONS REQUESTS (for CORS preflight) =======
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET REQUESTS
  if (req.method === "GET") {

    // Serve login page
    if (req.url === "/" || req.url === "/login.html") {
      fs.readFile(path.join(__dirname, "login.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve admin login page
    else if (req.url === "/admin-login.html") {
      fs.readFile(path.join(__dirname, "admin-login.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve staff login page
    else if (req.url === "/staff-login.html") {
      fs.readFile(path.join(__dirname, "staff-login.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve register page
    else if (req.url === "/register.html") {
      fs.readFile(path.join(__dirname, "register.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    // Serve dashboard
    else if (req.url === "/dashboard.html") {
      let html = fs.readFileSync(path.join(__dirname, "admin-dashboard.html"), "utf8");
      let menuHTML = '<p>Loading menu items...</p>';

      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);

        const items = await db.collection(menuCollection).find().toArray();
        await client.close();

        menuHTML = items.length === 0 ? '<p>No menu items found.</p>' : items.map(item => `
          <div class="menu-card">
            <img src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>Price: ₹${item.price}</p>
          </div>
        `).join("");
      } catch (err) {
        console.error(err);
        menuHTML = '<p>Unable to load menu items.</p>';
      }

      html = html.replace('<!-- Menu items dynamically inserted here -->', menuHTML);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    }

    // Serve uploaded images
    else if (req.url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) return res.end("File not found");
        const ext = path.extname(filePath).slice(1);
        res.writeHead(200, { "Content-Type": "image/" + ext });
        res.end(data);
      });
    }

    // API endpoint to get menu items
    else if (req.url === "/api/menu") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const items = await db.collection(menuCollection).find().toArray();
        await client.close();

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify(items));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Server error" }));
      }
    }

    // API endpoint to get reservations
    else if (req.url === "/api/reservations") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const reservations = await db.collection(reservationCollection).find().toArray();
        await client.close();

        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        });
        res.end(JSON.stringify(reservations));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Server error" }));
      }
    }

    // DELETE menu item
    else if (req.url.startsWith("/delete-menu/")) {
      const id = req.url.split("/delete-menu/")[1];
      const client = new MongoClient(mongoUrl);
      try {
        await client.connect();
        const db = client.db(dbName);

        await db.collection(menuCollection).deleteOne({ _id: new ObjectId(id) });
        res.writeHead(302, { Location: "/dashboard.html" });
        res.end();
      } catch (err) {
        console.error("Delete error:", err.message);
        res.writeHead(500);
        res.end("Server error");
      } finally {
        await client.close();
      }
    }

    // Serve staff dashboard
    else if (req.url === "/staff-dashboard.html") {
      try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        const reservations = await db.collection(reservationCollection).find().toArray();
        await client.close();

        let html = `<!DOCTYPE html><html><head><title>Staff Dashboard</title></head><body>
          <h1>Staff Dashboard - Reservations</h1>
          ${reservations.length === 0 ? '<p>No reservations found.</p>' : reservations.map(r => `
            <div><h4>${r.name}</h4><p>${r.email}</p><p>${r.date}</p></div>
          `).join('')}
        </body></html>`;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Server error");
      }
    }

    // Serve user dashboard
    else if (req.url === "/user-dashboard.html") {
      fs.readFile(path.join(__dirname, "user-dashboard.html"), (err, data) => {
        if (err) return res.end("File not found");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
    }

    else {
      res.writeHead(404);
      res.end("Not Found");
    }
  }

  // POST REQUESTS
  else if (req.method === "POST") {

    // SUBMIT RESERVATION
    if (req.url === "/submit-reservation") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const reservationData = JSON.parse(body);
          const client = new MongoClient(mongoUrl);
          await client.connect();
          const db = client.db(dbName);
          await db.collection(reservationCollection).insertOne(reservationData);
          await client.close();

          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ message: "Reservation submitted successfully" }));
        } catch (err) {
          console.error("Reservation error:", err);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Server error" }));
        }
      });
    }

    // LOGIN
    else if (req.url === "/login") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        const parsed = query.parse(body);
        const userid = parsed.userid ? parsed.userid.trim().toLowerCase() : '';
        const password = parsed.password ? parsed.password.trim() : '';
        const role = parsed.role ? parsed.role.trim().toLowerCase() : '';

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);

          let user = null;
          let userEmail = userid;

          if (role === "admin") {
            user = await db.collection(adminCollection).findOne({ adminId: userid, password });
          } else if (role === "staff") {
            user = await db.collection("staff").findOne({ staffId: userid, password });
          } else if (role === "user") {
            user = await db.collection(usersCollection).findOne({ email: userid, password: password });
            if (user) {
              userEmail = user.email;
            }
          }

          if (user) {
            let redirectUrl = "";
            if (role === "admin") {
            redirectUrl = "https://restaurant-cms-0tsu.onrender.com/dashboard.html";
            } else if (role === "staff") {
            redirectUrl = "https://restaurant-cms-0tsu.onrender.com/staff-dashboard.html";
            } else if (role === "user") {
            redirectUrl = "/user-dashboard.html?email=" + encodeURIComponent(userEmail);
            }
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({ success: true, redirect: redirectUrl, email: userEmail }));
          } else {
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({ success: false, error: "Invalid credentials!" }));
          }
        } catch (err) {
          console.error(err);
          res.writeHead(500, { "Content-Type": "text/html" });
          res.end("Database error: " + err.message);
        } finally {
          await client.close();
        }
      });
    }

    // REGISTER USER
    else if (req.url === "/register") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const { name, email, phone, password } = JSON.parse(body);
          
          const client = new MongoClient(mongoUrl);
          await client.connect();
          const db = client.db(dbName);

          // Check if email already exists
          const existingEmail = await db.collection(usersCollection).findOne({ email: email.toLowerCase() });
          if (existingEmail) {
            await client.close();
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({ success: false, error: "Email already registered!" }));
            return;
          }

          // Check if phone number already exists
          const existingPhone = await db.collection(usersCollection).findOne({ phone: phone });
          if (existingPhone) {
            await client.close();
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({ success: false, error: "Phone number already registered!" }));
            return;
          }

          // Create new user
          const newUser = {
            name,
            email: email.toLowerCase(),
            phone,
            password: password,
            createdAt: new Date()
          };

          await db.collection(usersCollection).insertOne(newUser);
          await client.close();

          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ success: true, message: "Registration successful!" }));
        } catch (err) {
          console.error("Registration error:", err);
          res.writeHead(500, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({ success: false, error: "Server error" }));
        }
      });
    }

    // ADD MENU ITEM
    else if (req.url === "/add-menu") {
      upload.single("imageFile")(req, res, async (err) => {
        if (err) return res.end("Upload error: " + err.message);

        const { name, price, category, foodType } = req.body;
        const image = req.file.path;

        const menuItem = { name, price, image, category };
        // Add foodType if provided
        if (foodType) {
          menuItem.foodType = foodType;
        }

        const client = new MongoClient(mongoUrl);
        try {
          await client.connect();
          const db = client.db(dbName);
          await db.collection(menuCollection).insertOne(menuItem);
          res.writeHead(302, { Location: "/dashboard.html" });
          res.end();
        } catch (err) {
          console.error("Database error:", err.message);
          res.writeHead(500);
          res.end("Database error: " + err.message);
        } finally {
          await client.close();
        }
      });
    }

    // UPDATE MENU ITEM
    else if (req.url.startsWith("/update-menu/")) {
      const id = req.url.split("/update-menu/")[1];
      
      // Handle both multipart and regular form data
      upload.single("imageFile")(req, res, async (err) => {
        try {
          const { name, price, category, foodType } = req.body;
          
          const updateData = {};
          if (name) updateData.name = name;
          if (price) updateData.price = price;
          if (category) updateData.category = category;
          if (foodType) updateData.foodType = foodType;
          if (req.file) {
            updateData.image = req.file.path;
          }

          const client = new MongoClient(mongoUrl);
          try {
            await client.connect();
            const db = client.db(dbName);
            await db.collection(menuCollection).updateOne(
              { _id: new ObjectId(id) },
              { $set: updateData }
            );
            await client.close();
            res.writeHead(302, { Location: "/dashboard.html" });
            res.end();
          } catch (err) {
            console.error("Update error:", err.message);
            res.writeHead(500);
            res.end("Update error: " + err.message);
          }
        } catch (err) {
          console.error("Error:", err.message);
          res.writeHead(500);
          res.end("Error: " + err.message);
        }
      });
    }

    else {
      res.writeHead(404);
      res.end("Not Found");
    }
  }

  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

