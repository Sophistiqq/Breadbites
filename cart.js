
// Add event listener to the "Add to Cart" button or element
const addToCartBtn = document.getElementById("addToCartBtn");
addToCartBtn.addEventListener("click", addToCart);

// Function to handle the "Add to Cart" functionality
function addToCart() {
  // Retrieve item information (e.g., item name, price, quantity)
  const itemName = "Example Item";
  const itemPrice = 9.99;
  const itemQuantity = 1;

  // Store the item information in the cart
  const cartItem = {
    name: itemName,
    price: itemPrice,
    quantity: itemQuantity,
  };

  // Add the item to the cart array or object
  cartItems.push(cartItem);

  // Update the cart display
  renderCartItems();
}

// Function to render the cart items in the HTML template
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  cartItemsContainer.innerHTML = "";

  // Loop through the cart items and render them in the HTML template
  cartItems.forEach((item) => {
    const itemElement = document.createElement("li");
    itemElement.textContent = item.name;
    cartItemsContainer.appendChild(itemElement);
  });
}
