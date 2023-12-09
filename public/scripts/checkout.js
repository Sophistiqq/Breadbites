// Client-side JavaScript
let confirmButton = document.querySelector('#checkout-confirm');

checkoutButton.addEventListener('click', function () {
    let cartItems = Array.from(cart.children);
    let checkoutCartItems = document.querySelector('#checkout-cart-items tbody');
    checkoutCartItems.innerHTML = '';
    cartItems.forEach(item => {
        let itemName = item.querySelector('.item-name').innerText;
        let itemPrice = item.querySelector('.item-price').innerText;
        let quantity = item.querySelector('.quantity').value;
        let row = document.createElement('tr');
        row.innerHTML = `<td>${itemName}</td><td>${itemPrice}</td><td>${quantity}</td>`;
        checkoutCartItems.appendChild(row);
    });
});

confirmButton.addEventListener('click', async function (event) {
    event.preventDefault();
    let deliveryDate = document.querySelector('#delivery-date').value;
    let deliveryTime = document.querySelector('#delivery-time').value;
    let addressOption = document.querySelector('input[name="addressOption"]:checked').value;
    let deliveryAddress = addressOption === 'another-address' ? document.querySelector('#delivery-address').value : '';

    let productOrders = Array.from(document.querySelector('#checkout-cart-items tbody').children).map(row => {
        let cells = row.children;
        return {
            productName: cells[0].innerText,
            price: parseFloat(cells[1].innerText.replace(/[^0-9.-]+/g, "")),
            quantity: parseInt(cells[2].innerText)
        };
    });

    let order = {
        userId: userId,
        deliveryDate: deliveryDate,
        deliveryTime: deliveryTime,
        addressOption: addressOption,
        deliveryAddress: deliveryAddress,
        productOrders: productOrders
    };

    console.log(order); // Log the data that will be sent

    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    }).then(response => {
        if (response.ok) {
            alert('Order placed successfully!');
            location.reload();
        } else {
            alert('Failed to place order.');
        }
    });

    // Check for insufficient stocks
    let insufficientStocks = await productOrders.some(async order => {
        let productStocks = await getProductStocks(order.productName);
        return order.quantity > productStocks;
    });

    if (insufficientStocks) {
        alert('Your order has been processed. However, if you chose a product that has no stock, please expect a delay of 2-3 hours before shipment if you want to deliver it right now.');
    }
});


async function getProductStocks(productName) {
    let response = await fetch(`/product-stock?product_name=${encodeURIComponent(productName)}`);
    let data = await response.json();
    return data.stock;
}