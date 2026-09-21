const SUPABASE_URL = "https://avdhtclicxvzolnzvgtl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FxpsqRhmYq22q-CbPqcTew_rPcLHvSh";

let supabaseClient = null;

const products = [
  {
    name: "DRIP WIRE",
    desc: "Select your required duration.",
    variants: [
      ["6 Hour", 43],
      ["12 Hour", 61],
      ["1 Day", 96],
      ["7 Day", 339]
    ]
  },
  {
    name: "DRIP PROXY ANDROID",
    desc: "Select your required duration.",
    variants: [
      ["1 Day", 65],
      ["3 Day", 125],
      ["7 Day", 240]
    ]
  },
  {
    name: "DRIP CLIENT [ NON-ROOT ]",
    desc: "Select your required duration.",
    variants: [
      ["1 Day", 75],
      ["3 Day", 130],
      ["7 Day", 210],
      ["15 Day", 380],
      ["30 Day", 590]
    ]
  }
];

let cart = JSON.parse(localStorage.getItem("enzyyy_cart") || "[]");
let orders = JSON.parse(localStorage.getItem("enzyyy_orders") || "[]");
let currentUser = null;

const $ = s => document.querySelector(s);

function loadSupabase() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Supabase library failed to load."));

    document.head.appendChild(script);
  });
}

async function initSupabase() {
  try {
    await loadSupabase();

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    currentUser = session?.user || null;

    updateAccount();
    renderOrders();

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      updateAccount();
      renderOrders();
    });

  } catch (error) {
    console.error("Supabase error:", error);
    alert("Authentication system load nahi ho paaya. Page refresh karo.");
  }
}

function renderProducts(filter = "") {
  const grid = $("#productGrid");

  grid.innerHTML = products
    .filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    )
    .map((p, i) => `
      <article class="card">
        <div class="thumb">
          <div class="mini">E</div>
        </div>

        <h3>${p.name}</h3>
        <p>${p.desc}</p>

        <div class="variants">
          ${p.variants.map((v, j) => `
            <button class="variant" onclick="addToCart(${i},${j})">
              <b>${v[0]}</b>
              <span>₹${v[1]}</span>
            </button>
          `).join("")}
        </div>
      </article>
    `)
    .join("");
}

function save() {
  localStorage.setItem(
    "enzyyy_cart",
    JSON.stringify(cart)
  );

  localStorage.setItem(
    "enzyyy_orders",
    JSON.stringify(orders)
  );
}

function renderCart() {
  const items = cart.map((x, i) => `
    <div class="panel" style="margin-bottom:9px">
      <b>${x.name}</b>

      <div style="color:#8b90a0;font-size:12px">
        ${x.variant} • ₹${x.price}
      </div>

      <button
        onclick="removeCart(${i})"
        style="margin-top:8px;background:none;color:#ff7b91">
        Remove
      </button>
    </div>
  `).join("");

  let total = cart.reduce((a, x) => a + x.price, 0);

  $("#modalContent").innerHTML = `
    <h2>Your Cart</h2>

    ${items || '<p style="color:#777">Your cart is empty.</p>'}

    <div class="checkout">
      <span class="total">₹${total}</span>

      <button class="primary" onclick="checkout()">
        Checkout
      </button>
    </div>
  `;
}

function addToCart(pi, vi) {
  const p = products[pi];
  const v = p.variants[vi];

  cart.push({
    name: p.name,
    variant: v[0],
    price: v[1]
  });

  save();
  updateCount();

  openModal();
  renderCart();
}

function removeCart(i) {
  cart.splice(i, 1);

  save();
  updateCount();
  renderCart();
}

function updateCount() {
  $("#cartCount").textContent = cart.length;
}

function openModal() {
  $("#modal").classList.remove("hidden");
}

function closeModal() {
  $("#modal").classList.add("hidden");
}

function loginForm(mode = "login") {

  if (mode === "login") {

    $("#modalContent").innerHTML = `
      <h2>Welcome back</h2>

      <form class="form" onsubmit="login(event)">

        <input
          id="email"
          type="email"
          placeholder="Email"
          required
        >

        <input
          id="pass"
          type="password"
          placeholder="Password"
          required
        >

        <button type="submit">
          Login
        </button>

      </form>

      <div class="switch">
        New here?
        <a onclick="loginForm('signup')">
          Create account
        </a>
      </div>
    `;

  } else {

    $("#modalContent").innerHTML = `
      <h2>Create account</h2>

      <form class="form" onsubmit="signup(event)">

        <input
          id="name"
          placeholder="Name"
          required
        >

        <input
          id="email"
          type="email"
          placeholder="Email"
          required
        >

        <input
          id="pass"
          type="password"
          minlength="6"
          placeholder="Password (6+ characters)"
          required
        >

        <button type="submit">
          Sign up
        </button>

      </form>

      <div class="switch">
        Already registered?
        <a onclick="loginForm('login')">
          Login
        </a>
      </div>
    `;
  }
}

async function signup(e) {
  e.preventDefault();

  if (!supabaseClient) {
    alert("Authentication system abhi load nahi hua.");
    return;
  }

  const name = $("#name").value.trim();
  const email = $("#email").value.trim().toLowerCase();
  const password = $("#pass").value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (data.session) {
    currentUser = data.user;

    closeModal();
    updateAccount();
    renderOrders();

    alert("Account successfully created!");
  } else {
    closeModal();

    alert(
      "Account create ho gaya! 📧\n\n" +
      "Apne email inbox me confirmation link open karo, " +
      "phir website par Login karo."
    );
  }
}

async function login(e) {
  e.preventDefault();

  if (!supabaseClient) {
    alert("Authentication system abhi load nahi hua.");
    return;
  }

  const email = $("#email").value.trim().toLowerCase();
  const password = $("#pass").value;

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = data.user;

  closeModal();
  updateAccount();
  renderOrders();

  alert("Login successful! ✅");
}

async function logout() {

  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = null;

  updateAccount();
  renderOrders();
}

function updateAccount() {

  const btn = $("#accountBtn");

  if (!btn) return;

  if (currentUser) {

    const name =
      currentUser.user_metadata?.name ||
      currentUser.email?.split("@")[0] ||
      "Account";

    btn.textContent = name;

    btn.onclick = logout;

  } else {

    btn.textContent = "Login";

    btn.onclick = () => {
      openModal();
      loginForm();
    };
  }
}

function checkout() {

  if (!currentUser) {

    alert("Please login before checkout.");

    openModal();
    loginForm();

    return;
  }

  if (!cart.length) return;

  const total =
    cart.reduce((a, x) => a + x.price, 0);

  orders.push({
    email: currentUser.email,
    items: [...cart],
    total,
    status: "Payment pending",
    date: new Date().toLocaleString()
  });

  cart = [];

  save();
  updateCount();
  closeModal();
  renderOrders();

  alert(
    "Order created successfully.\n\n" +
    "Payment gateway baad me connect hoga."
  );
}

function renderOrders() {

  const box = $("#ordersBox");

  if (!currentUser) {

    box.className = "panel empty";
    box.textContent = "Login to see your orders.";

    return;
  }

  const mine = orders.filter(
    o => o.email === currentUser.email
  );

  box.className = "panel";

  box.innerHTML = mine.length
    ? [...mine].reverse().map(o => `
        <div style="
          padding:13px 0;
          border-bottom:1px solid #242733
        ">

          <b>Order</b>

          <div style="
            color:#7f8495;
            font-size:12px
          ">
            ${o.date} • ${o.status}
          </div>

          <div style="margin-top:6px">
            ₹${o.total}
          </div>

        </div>
      `).join("")
    : "No orders yet.";
}

$("#cartBtn").onclick = () => {
  openModal();
  renderCart();
};

$("#search").oninput = e =>
  renderProducts(e.target.value);

$("#modal").onclick = e => {
  if (e.target.id === "modal") {
    closeModal();
  }
};

renderProducts();
updateCount();
renderOrders();
initSupabase();
