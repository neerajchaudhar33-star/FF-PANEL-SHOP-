const products=[
{name:"DRIP WIRE",desc:"Select your required duration.",variants:[["6 Hour",43],["12 Hour",61],["1 Day",96],["7 Day",339]]},
{name:"DRIP PROXY ANDROID",desc:"Select your required duration.",variants:[["1 Day",65],["3 Day",125],["7 Day",240]]},
{name:"DRIP CLIENT [ NON-ROOT ]",desc:"Select your required duration.",variants:[["1 Day",75],["3 Day",130],["7 Day",210],["15 Day",380],["30 Day",590]]}
];
let cart=JSON.parse(localStorage.getItem("enzyyy_cart")||"[]");
let users=JSON.parse(localStorage.getItem("enzyyy_users")||"[]");
let orders=JSON.parse(localStorage.getItem("enzyyy_orders")||"[]");
let current=localStorage.getItem("enzyyy_current")||"";
const $=s=>document.querySelector(s);
function renderProducts(filter=""){const grid=$("#productGrid");grid.innerHTML=products.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())).map((p,i)=>`<article class="card"><div class="thumb"><div class="mini">E</div></div><h3>${p.name}</h3><p>${p.desc}</p><div class="variants">${p.variants.map((v,j)=>`<button class="variant" onclick="addToCart(${i},${j})"><b>${v[0]}</b><span>₹${v[1]}</span></button>`).join("")}</div></article>`).join("")}
function save(){localStorage.setItem("enzyyy_cart",JSON.stringify(cart));localStorage.setItem("enzyyy_users",JSON.stringify(users));localStorage.setItem("enzyyy_orders",JSON.stringify(orders))}
function renderCart(){const items=cart.map((x,i)=>`<div class="panel" style="margin-bottom:9px"><b>${x.name}</b><div style="color:#8b90a0;font-size:12px">${x.variant} • ₹${x.price}</div><button onclick="removeCart(${i})" style="margin-top:8px;background:none;color:#ff7b91">Remove</button></div>`).join("");let total=cart.reduce((a,x)=>a+x.price,0);$("#modalContent").innerHTML=`<h2>Your Cart</h2>${items||'<p style="color:#777">Your cart is empty.</p>'}<div class="checkout"><span class="total">₹${total}</span><button class="primary" onclick="checkout()">Checkout</button></div>`}
function addToCart(pi,vi){const p=products[pi],v=p.variants[vi];cart.push({name:p.name,variant:v[0],price:v[1]});save();updateCount();openModal();renderCart()}
function removeCart(i){cart.splice(i,1);save();updateCount();renderCart()}
function updateCount(){$("#cartCount").textContent=cart.length}
function openModal(){ $("#modal").classList.remove("hidden") }
function closeModal(){ $("#modal").classList.add("hidden") }
function loginForm(mode="login"){$("#modalContent").innerHTML=mode==="login"?`<h2>Welcome back</h2><form class="form" onsubmit="login(event)"><input id="email" type="email" placeholder="Email" required><input id="pass" type="password" placeholder="Password" required><button>Login</button></form><div class="switch">New here? <a onclick="loginForm('signup')">Create account</a></div>`:`<h2>Create account</h2><form class="form" onsubmit="signup(event)"><input id="name" placeholder="Name" required><input id="email" type="email" placeholder="Email" required><input id="pass" type="password" minlength="6" placeholder="Password (6+ characters)" required><button>Sign up</button></form><div class="switch">Already registered? <a onclick="loginForm('login')">Login</a></div>`}
function signup(e){e.preventDefault();let email=$("#email").value.toLowerCase();if(users.some(u=>u.email===email))return alert("Account already exists.");users.push({name:$("#name").value,email,password:$("#pass").value});current=email;save();closeModal();updateAccount();alert("Account created.")}
function login(e){e.preventDefault();let email=$("#email").value.toLowerCase(),pass=$("#pass").value,u=users.find(x=>x.email===email&&x.password===pass);if(!u)return alert("Invalid email or password.");current=email;localStorage.setItem("enzyyy_current",current);closeModal();updateAccount();renderOrders()}
function logout(){current="";localStorage.removeItem("enzyyy_current");updateAccount();renderOrders()}
function updateAccount(){$("#accountBtn").textContent=current?"Logout":"Login";$("#accountBtn").onclick=current?logout:()=>{openModal();loginForm()}}
function checkout(){if(!current){alert("Please login before checkout.");openModal();loginForm();return}if(!cart.length)return;let total=cart.reduce((a,x)=>a+x.price,0);orders.push({email:current,items:[...cart],total,status:"Payment pending",date:new Date().toLocaleString()});cart=[];save();updateCount();closeModal();renderOrders();alert("Order created. Payment gateway will be connected later.")}
function renderOrders(){let box=$("#ordersBox");if(!current){box.className="panel empty";box.textContent="Login to see your orders.";return}let mine=orders.filter(o=>o.email===current);box.className="panel";box.innerHTML=mine.length?mine.reverse().map(o=>`<div style="padding:13px 0;border-bottom:1px solid #242733"><b>Order</b><div style="color:#7f8495;font-size:12px">${o.date} • ${o.status}</div><div style="margin-top:6px">₹${o.total}</div></div>`).join(""):"No orders yet."}
$("#cartBtn").onclick=()=>{openModal();renderCart()};$("#search").oninput=e=>renderProducts(e.target.value);$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
renderProducts();updateCount();updateAccount();renderOrders();