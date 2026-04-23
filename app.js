// ---------------- GLOBAL ----------------
let currentUser = null;
let role = null;
let selectedSeat = null;
let selectedRoute = null;

let users = JSON.parse(localStorage.getItem("users")) || {
  admin: { password: "admin", role: "admin" }
};

const routes = [
  {
    id: 1,
    name: "Douala → Yaoundé",
    distance: 240,
    pricePerKm: 50,
    schedules: ["08:00", "12:00", "18:00"],
    coords: [4.05, 9.7]
  },
  {
    id: 2,
    name: "Yaoundé → Bafoussam",
    distance: 300,
    pricePerKm: 45,
    schedules: ["07:30", "13:00", "20:00"],
    coords: [3.8, 11.5]
  }
];

// ---------------- NAV ----------------
function showPage(page) {
  const app = document.getElementById("app");

if (page === "home") {
  app.innerHTML = `
    
    <!-- HERO 1 -->
    <section class="hero hero1">
     
      <p>Fast • Secure • Comfortable Travel</p>

      <div class="hero-buttons">
        <button onclick="showPage('signup')">Get Started</button>
        <button class="secondary" onclick="showPage('login')">Login</button>
      </div>
    </section>

    <!-- HERO 2 -->
    <section class="hero hero2">
      <h1>Travel Safely Across Cities</h1>
      <p>Book your bus tickets in seconds</p>
    </section>

    <!-- HERO 3 -->
    <section class="hero hero3">
      <h1>Comfort & Speed Combined</h1>
      <p>Modern buses for your journey</p>
    </section>

    <!-- DESTINATIONS -->
    <section class="destinations">
      <h2>Popular Destinations</h2>

      <div class="grid">
        <div class="place">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc5jFGJtryMU1lZqwKCchRIg-X5mWbktf0fA&s">
          <h3>Douala → Yaoundé</h3>
        </div>

        <div class="place">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStjdjO_8a-QNMjIQvtl2Iue1N028ZVWN0caA&s">
          <h3>Yaoundé → Bafoussam</h3>
        </div>
      </div>
    </section>

  `;
}
  if (page === "login") {
  app.innerHTML = `
    <div class="card">
      <h2>Login</h2>

      <input id="username" placeholder="Username">
      <input id="password" type="password" placeholder="Password">

      <button onclick="login()">Login</button>
    </div>
  `;
}

 if (page === "signup") {
  app.innerHTML = `
    <div class="card">
      <h2>Créer un compte</h2>

      <label>Nom d'utilisateur</label>
      <input id="newUser" placeholder="Entrez votre nom">

      <label>Mot de passe</label>
      <input id="newPass" type="password" placeholder="••••••••">

      <label>Choisir votre rôle</label>
      <select id="roleSelect">
        <option value="passenger">Passenger</option>
        <option value="driver">Driver</option>
        <option value="admin">Administrator</option>
        <option value="manager">Manager</option>
      </select>

      <button onclick="signup()">S'inscrire</button>
    </div>
  `;
}

  if (page === "dashboard") {
    if (!currentUser) return showPage("login");
    if (role === "admin") adminDashboard();
else if (role === "manager") managerDashboard();
else if (role === "driver") driverDashboard();
else userDashboard();
  }
}

// ---------------- AUTH ----------------
function signup() {
  let username = newUser.value.trim();
  let password = newPass.value.trim();
  let roleSelected = roleSelect.value;

  if (!username || !password) {
    return alert("Please fill all fields");
  }

  if (users[username]) {
    return alert("User already exists");
  }

  users[username] = {
    password: password,
    role: roleSelected
  };

  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created successfully");
  showPage("login");
}

function login() {
  let user = username.value;
  let pass = password.value;

  if (!users[user] || users[user].password !== pass) {
    return alert("Invalid credentials");
  }

  currentUser = user;
  role = users[user].role;

  localStorage.setItem("currentUser", currentUser);
  localStorage.setItem("role", role);

  updateNavbar();
  showPage("dashboard");
}

function logout() {
  currentUser = null;
  role = null;

  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");

  updateNavbar();
  showPage("home");
}

// ---------------- USER DASHBOARD ----------------
function userDashboard() {
  let app = document.getElementById("app");

  let options = routes.map(r => `<option value="${r.id}">${r.name}</option>`).join("");

  app.innerHTML = `
    <div class="card">
      <h2>Book Your Trip</h2>

      <select id="routeSelect">${options}</select>
      <select id="scheduleSelect"></select>

      <p id="info"></p>
      <button onclick="selectRoute()">Search</button>

      <div id="map"></div>
    </div>

    <div class="card">
      <h2>Select Seat</h2>
      <div id="seats" class="seats"></div>
      <button onclick="startPayment()">Confirm Booking</button>
      <div id="paymentBox"></div>
    </div>

    <div class="card">
      <h2>My Bookings</h2>
      <ul id="myBookings"></ul>
    </div>
  `;

  generateSeats();
  updateSchedules();
  displayBookings();
}

// ---------------- ROUTE ----------------
function updateSchedules() {
  let r = routes.find(x => x.id == routeSelect.value);
  scheduleSelect.innerHTML = r.schedules.map(s => `<option>${s}</option>`).join("");
}

document.addEventListener("change", e => {
  if (e.target.id === "routeSelect") updateSchedules();
});

function selectRoute() {
  selectedRoute = routes.find(r => r.id == routeSelect.value);
  let price = selectedRoute.distance * selectedRoute.pricePerKm;

  info.innerHTML = `Distance: ${selectedRoute.distance} km | Price: ${price} FCFA`;

  if (window.mapInstance) window.mapInstance.remove();

  window.mapInstance = L.map("map").setView(selectedRoute.coords, 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(window.mapInstance);
}

// ---------------- SEATS ----------------
function generateSeats() {
  let div = document.getElementById("seats");
  for (let i = 1; i <= 20; i++) {
    let s = document.createElement("div");
    s.className = "seat";
    s.innerText = i;

    s.onclick = () => {
      document.querySelectorAll(".seat").forEach(x => x.classList.remove("selected"));
      s.classList.add("selected");
      selectedSeat = i;
    };

    div.appendChild(s);
  }
}

// ---------------- PAYMENT ----------------

 function startPayment() {
  if (!selectedSeat || !selectedRoute) return alert("Select route & seat");

  let price = selectedRoute.distance * selectedRoute.pricePerKm;

  paymentBox.innerHTML = `
    <div class="card">
      <h3>Payment</h3>
      <p>Total: ${price} FCFA</p>

      <input placeholder="Card Number">
      <input placeholder="MM/YY">
      <input placeholder="CVV">

      <button onclick="confirmPayment()">Pay Now</button>
    </div>
  `;
}

function confirmPayment() {
  let price = selectedRoute.distance * selectedRoute.pricePerKm;

  let booking = {
    user: currentUser,
    route: selectedRoute.name,
    price: price,
    seat: selectedSeat,
    date: new Date().toLocaleString(),
    id: Math.floor(Math.random()*100000)
  };

  let list = JSON.parse(localStorage.getItem("bookings")) || [];
  list.push(booking);
  localStorage.setItem("bookings", JSON.stringify(list));

  paymentBox.innerHTML = `
    <div class="ticket">
      <h2>🎟️ SmartBus Ticket</h2>
      <p><b>ID:</b> ${booking.id}</p>
      <p><b>User:</b> ${booking.user}</p>
      <p><b>Route:</b> ${booking.route}</p>
      <p><b>Seat:</b> ${booking.seat}</p>
      <p><b>Price:</b> ${booking.price} FCFA</p>
      <p><b>Date:</b> ${booking.date}</p>
      <canvas id="qr"></canvas>
    </div>
  `;

  QRCode.toCanvas(document.getElementById("qr"), JSON.stringify(booking));

  displayBookings();
}

// ---------------- BOOKINGS ----------------
function displayBookings() {
  let list = document.getElementById("myBookings");
  if (!list) return;

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  list.innerHTML = "";
  bookings.filter(b => b.user === currentUser).forEach(b => {
    let li = document.createElement("li");
    li.innerText = `${b.route} | ${b.price} FCFA`;
    list.appendChild(li);
  });
}

// ---------------- ADMIN DASHBOARD (UPGRADED) ----------------
function adminDashboard() {
  let app = document.getElementById("app");

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  let totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);

  app.innerHTML = `
    <h2>Admin Dashboard</h2>

    <div class="card">
      <p>Total Users: ${Object.keys(users).length}</p>
      <p>Total Bookings: ${bookings.length}</p>
      <p>Total Revenue: ${totalRevenue} FCFA</p>
    </div>

    <div class="card">
      <h3>All Bookings</h3>
      <table id="table"></table>
    </div>

    <div class="card">
      <canvas id="chart"></canvas>
    </div>
  `;

  let table = document.getElementById("table");

  table.innerHTML = `
    <tr><th>User</th><th>Route</th><th>Seat</th><th>Price</th></tr>
  `;

  bookings.forEach(b => {
    table.innerHTML += `
      <tr><td>${b.user}</td><td>${b.route}</td><td>${b.seat}</td><td>${b.price}</td></tr>
    `;
  });

  new Chart(chart, {
    type: "bar",
    data: {
      labels: ["Bookings", "Revenue"],
      datasets: [{ data: [bookings.length, totalRevenue] }]
    }
  });
}

// ---------------- INIT ----------------
showPage("home");

window.onload = () => {
  let loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
};

//DRIVER DASHBOARD
function driverDashboard() {
  let app = document.getElementById("app");

  app.innerHTML = `
    <div class="card">
      <h2>Driver Dashboard</h2>
      <p>View your assigned trips</p>
      <ul>
        <li>Trip Douala → Yaoundé - 08:00</li>
      </ul>
    </div>
  `;
}

//MANAGER DASHBOARD
function managerDashboard() {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  let total = bookings.reduce((sum, b) => sum + b.price, 0);

  app.innerHTML = `
    <div class="card">
      <h2>Manager Dashboard</h2>
      <p>Total Revenue: ${total} FCFA</p>
      <p>Total Trips: ${bookings.length}</p>
    </div>
  `;
}

function initSession() {
  currentUser = localStorage.getItem("currentUser");
  role = localStorage.getItem("role");

  updateNavbar();

  if (currentUser && role) {
    showPage("dashboard");
  } else {
    showPage("home");
  }
}

initSession();

function updateNavbar() {
  let nav = document.getElementById("nav-actions");
  if (!nav) return;

  if (currentUser) {
    let userImage = localStorage.getItem("profileImg_" + currentUser);

    nav.innerHTML = `
      <div class="nav-user">
        
        <button class="profile-btn" onclick="toggleDropdown()">
          ${
            userImage
              ? `<img src="${userImage}" class="nav-avatar">`
              : `👤 ${currentUser} ▾`
          }
        </button>

        <div id="dropdown" class="dropdown">
          <button onclick="showPage('dashboard')">📊 Tableau de bord</button>
          <button onclick="showProfile()">👤 Profil</button>
          <button onclick="logout()">🚪 Déconnexion</button>
        </div>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <button onclick="showPage('login')">Login</button>
      <button onclick="showPage('signup')">Sign Up</button>
    `;
  }
}

function toggleDropdown() {
  let menu = document.getElementById("dropdown");
  if (menu) {
    menu.classList.toggle("show");
  }
}

// fermer si clic ailleurs
document.addEventListener("click", function(e) {
  let nav = document.querySelector(".nav-user");
  let menu = document.getElementById("dropdown");

  if (menu && nav && !nav.contains(e.target)) {
    menu.classList.remove("show");
  }
});

function showProfile() {
  let app = document.getElementById("app");

  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  let userBookings = bookings.filter(b => b.user === currentUser);

  let userImage = localStorage.getItem("profileImg_" + currentUser);

  app.innerHTML = `
    <div class="card profile-card">

      <div class="profile-header">

        <div class="avatar" onclick="document.getElementById('fileInput').click()">
          ${
            userImage
              ? `<img src="${userImage}">`
              : currentUser.charAt(0).toUpperCase()
          }
        </div>

        <input type="file" id="fileInput"
               accept="image/*"
               style="display:none"
               onchange="uploadProfilePic(event)">

        <h2>${currentUser}</h2>
        <p>${role}</p>
      </div>

      <hr>

      <p>📊 Réservations : <b>${userBookings.length}</b></p>

    </div>
  `;
}


function uploadProfilePic(event) {
  let file = event.target.files[0];

  if (!file) return;

  let reader = new FileReader();

  reader.onload = function(e) {
    let imageData = e.target.result;

    // sauvegarde dans localStorage
    localStorage.setItem("profileImg_" + currentUser, imageData);

    // refresh profil
    showProfile();
  };

  reader.readAsDataURL(file);
}


function uploadProfilePic(event) {
  let file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();

  reader.onload = function(e) {
    localStorage.setItem("profileImg_" + currentUser, e.target.result);
    showProfile();
    updateNavbar(); // 🔥 important
  };

  reader.readAsDataURL(file);
}