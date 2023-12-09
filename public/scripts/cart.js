// let addToCartButtons = document.querySelectorAll('.add-to-cart');
//     let cart = document.querySelector('.cart-content ul');
//     let totalCost = 0;

//     function updateTotalCost() {
//         totalCost = 0;
//         Array.from(cart.children).forEach(item => {
//             let itemPrice = item.querySelector('.item-price').innerText;
//             let itemPriceValue = parseFloat(itemPrice.replace(/[^0-9.-]+/g, ""));
//             let quantity = parseInt(item.querySelector('.quantity').value);
//             totalCost += itemPriceValue * quantity;
//         });

//         let totalCostElement = document.querySelector('#totalCostAmount');
//         totalCostElement.innerText = totalCost.toFixed(2);
//     }

//     addToCartButtons.forEach(button => {
//         button.addEventListener('click', function () {
//             let productInfo = this.parentElement;
//             let productName = productInfo.querySelector('h1').innerText;
//             let productPrice = productInfo.children[2].innerText;
//             let productPriceValue = parseFloat(productPrice.replace(/[^0-9.-]+/g, ""));

//             let existingCartItem = Array.from(cart.children).find(item => {
//                 let itemName = item.querySelector('.item-name').innerText;
//                 return itemName === productName;
//             });

//             if (existingCartItem) {
//                 let quantityElement = existingCartItem.querySelector('.quantity');
//                 let quantity = parseInt(quantityElement.value);
//                 quantityElement.value = quantity + 1;
//             } else {
//                 let cartItem = document.createElement('li');
//                 cartItem.className = "cart-item";
//                 cartItem.innerHTML = `
//                                     <div class="item-info">
//                                         <h5 class="item-name">${productName}</h5>
//                                         <p class="item-price">${productPrice}</p>
//                                     </div>
//                                     <div class="item-quantity">
//                                         <input type="number" class="quantity" value="1" readonly>
//                                         <button class="add-quantity">+</button>
//                                         <button class="remove-quantity">-</button>
//                                     </div>
//                                     <button class="remove-item">Remove</button>
//                                 `;
//                 cart.appendChild(cartItem);
//             }

//             updateTotalCost();
//         });
//     });

//     cart.addEventListener('click', function (event) {
//         if (event.target.classList.contains('add-quantity')) {
//             let quantityElement = event.target.previousElementSibling;
//             let quantity = parseInt(quantityElement.value);
//             quantityElement.value = quantity + 1;
//         } else if (event.target.classList.contains('remove-quantity')) {
//             let quantityElement = event.target.parentElement.querySelector('.quantity');
//             let quantity = parseInt(quantityElement.value);
//             if (quantity > 1) {
//                 quantityElement.value = quantity - 1;
//             }
//         } else if (event.target.classList.contains('remove-item')) {
//             let cartItem = event.target.closest('.cart-item');
//             cartItem.remove();
//         }

//         updateTotalCost();
//     });