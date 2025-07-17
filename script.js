/* script.js */
let cartCount = 0;

const products = [
  {
    name: "Samsung Galaxy M13",
    price: 9999,
    image: "https://imgs.search.brave.com/Mgyq1m06QYuEnvoiwm_Uyw956NVwGfGnTmsgbIKe75M/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/Z2l6bG9naWMuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzA1L1NhbXN1bmct/R2FsYXh5LU0xMy1D/ZWxlc3RlLmpwZw",
    description: "6.6-inch FHD+ Display, 6000mAh Battery, 50MP Triple Camera"
  },
  {
    name: "Sony Headphones",
    price: 1299,
    image: "https://imgs.search.brave.com/zIlOFAUZRL662nl68dgMzEAv__Q55Y5mM-fpMjNqkhQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAyMi8x/MC8wNi8yMS80OS9o/ZWFkcGhvbmVzLTc1/MDM2MzFfNjQwLmpw/Zw",
    description: "Over-Ear Wired Headphones with Noise Isolation"
  },
  {
    name: "HP Laptop",
    price: 45999,
    image: "https://m.media-amazon.com/images/I/71vFKBpKakL._AC_UY327_FMwebp_QL65_.jpg",
    description: "15.6\" Display, Intel i5, 8GB RAM, 512GB SSD"
  },
  {
    name: "Boat Smartwatch",
    price: 1999,
    image: "https://imgs.search.brave.com/WsMl5j8VbIuYmz17ZAL-c67Liu4aPbiVJJWf3KcaGvU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/Ym9hdC1saWZlc3R5/bGUuY29tL2Nkbi9z/aG9wL2ZpbGVzL0Fy/dGJvYXJkXzJfY29w/eV8yXzE4MDB4LnBu/Zz92PTE3NDY1OTc4/NDA",
    description: "Fitness Smartwatch with SpO2, HR, Sleep Monitoring"
  }
];

function renderProducts(productArray) {
  const container = document.getElementById("productSection");
  container.innerHTML = "";
  productArray.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      <button onclick="addToCart(event)">Add to Cart</button>
    `;
    card.addEventListener("click", (e) => {
      if (!e.target.matches('button')) {
        openModal(index);
      }
    });
    container.appendChild(card);
  });
}

function addToCart(e) {
  e.stopPropagation();
  cartCount++;
  document.getElementById("cart-count").textContent = cartCount;
}

function handleSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = products.filter(product => product.name.toLowerCase().includes(query));
  renderProducts(filtered);
}

function openModal(index) {
  const product = products[index];
  document.getElementById("modalImg").src = product.image;
  document.getElementById("modalName").textContent = product.name;
  document.getElementById("modalPrice").textContent = `Price: ₹${product.price}`;
  document.getElementById("modalDesc").textContent = product.description;
  document.getElementById("productModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

// Initial render
renderProducts(products);
