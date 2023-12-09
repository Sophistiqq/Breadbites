function closeModal() {
    var modal = document.querySelector('.add-user-modal');
    modal.classList.remove('show');
}

function openModal() {
    var modal = document.querySelector('.add-user-modal');
    modal.classList.add('show');
}

var addButton = document.getElementById('add-user');
addButton.addEventListener('click', openModal);

var closeButton = document.querySelector('.close-button');
closeButton.addEventListener('click', closeModal);

function populateModal(event) {
    var row = event.target.closest('.user-row');
    var inputs = document.querySelectorAll('.edit-user-modal input, .edit-user-modal select');
    inputs[0].value = row.querySelector('.user-id').textContent;
    inputs[1].value = row.querySelector('.user-fullname').textContent;
    inputs[2].value = row.querySelector('.user-username').textContent;
    inputs[3].value = row.querySelector('.user-email').textContent;
    inputs[4].value = row.querySelector('.user-password').textContent;
    inputs[5].value = row.querySelector('.user-contact-number').textContent;
    inputs[6].value = row.querySelector('.user-address').textContent;
    inputs[7].value = row.querySelector('.user-role').textContent;
}

var tableRows = document.querySelectorAll('.user-row');
tableRows.forEach(function(row) {
    row.addEventListener('click', populateModal);
});

function closeModal() {
    var modal = document.querySelector('.add-user-modal');
    modal.classList.remove('show');
}

function highlightTableRow(event) {
    var tableRows = document.querySelectorAll('.user-row');
    tableRows.forEach(function(row) {
        row.classList.remove('highlight');
    });
    event.target.closest('.user-row').classList.add('highlight');
}

function highlightTableRows() {
    var tableRows = document.querySelectorAll('.user-row');
    tableRows.forEach(function(row) {
        row.addEventListener('click', highlightTableRow);
    });
}

highlightTableRows();

// Add event listener to the close button for the edit modal
var closeEditButton = document.getElementById('close-button-edit');
closeEditButton.addEventListener('click', closeEditModal);

function closeEditModal() {
    var editModal = document.querySelector('.edit-user-modal');
    editModal.classList.remove('show');
}

// Add event listener to the "Edit User" button to open the edit modal
var editButton = document.getElementById('edit-user');
editButton.addEventListener('click', openEditModal);

function openEditModal() {
    var editModal = document.querySelector('.edit-user-modal');
    var highlightedRow = document.querySelector('.user-row.highlight');
    if (highlightedRow) {
        editModal.classList.add('show');
    }
}




// Delete the selected user, it will send a request to the server to delete the user, express will handle the request and delete the user from the database
// button: <button id="delete-user">Delete User</button>
var deleteUserButton = document.querySelector('#delete-user');
deleteUserButton.addEventListener('click', deleteUser);

function deleteUser() {
    var highlightedRow = document.querySelector('.user-row.highlight');
    var userId = highlightedRow.querySelector('.user-id').textContent;
    var username = highlightedRow.querySelector('.user-username').textContent;

    var confirmation = prompt('Please enter the username "' + username + '" to confirm deletion:');
    if (confirmation === username) {
        fetch('./admin-delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            location.reload(); // Reload the page after deletion
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert('Username does not match. Deletion canceled.');
    }
}

setInterval(() => {
    fetch('./uptime')
        .then(response => response.text())
        .then(uptime => {
            document.getElementById('systemUptime').textContent = uptime;
        });
}, 1000);





// Function to highlight a product row
function highlightProductRow(event) {
    // Remove highlight from previously highlighted row
    var highlightedRow = document.querySelector('.product-row.highlight');
    if (highlightedRow) {
        highlightedRow.classList.remove('highlight');
    }

    // Add highlight to the clicked row
    var clickedRow = event.target.closest('.product-row');
    clickedRow.classList.add('highlight');
}

// Add event listener to each product row
var productRows = document.querySelectorAll('.product-row');
productRows.forEach(function(row) {
    row.addEventListener('click', highlightProductRow);
});




var deleteProductButton = document.querySelector('#delete-product');
deleteProductButton.addEventListener('click', deleteProduct);

function deleteProduct() {
    var highlightedRow = document.querySelector('.product-row.highlight');
    if (!highlightedRow) return;

    var productId = highlightedRow.querySelector('td[data-th="ID"]').textContent;
    var productName = highlightedRow.querySelector('td[data-th="Name"]').textContent;

    var confirmation = prompt('Please enter the product name "' + productName + '" to confirm deletion:');
    if (confirmation === productName) {
        fetch('./admin-delete-product', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId: productId }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            location.reload(); // Reload the page after deletion
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        alert('Product name does not match. Deletion canceled.');
    }
}



// Select the add product button
var addProductButton = document.querySelector('#add-product');

// Add event listener to the add product button
addProductButton.addEventListener('click', openAddProductModal);

function openAddProductModal() {
    // Select the add product modal
    var addProductModal = document.querySelector('.add-product-modal');

    // Show the add product modal
    addProductModal.classList.add('show');
}

// Select the close button in the add product modal
var closeAddProductButton = document.querySelector('.add-product-modal .close-button');

// Add event listener to the close button in the add product modal
closeAddProductButton.addEventListener('click', closeAddProductModal);

function closeAddProductModal() {
    // Select the add product modal
    var addProductModal = document.querySelector('.add-product-modal');

    // Hide the add product modal
    addProductModal.classList.remove('show');
}

// Select the edit product button
var editProductButton = document.querySelector('#edit-product');


// Add event listener to the edit product button
editProductButton.addEventListener('click', openEditProductModal);

function openEditProductModal() {
    // Select the edit product modal
    var editProductModal = document.querySelector('.edit-product-modal');

    // Find the highlighted product row
    var highlightedRow = document.querySelector('.product-row.highlight');

    // If no row is highlighted, do nothing
    if (!highlightedRow) return;

    // Populate the edit product modal with the product data
    document.getElementById('edit-product-id').value = highlightedRow.querySelector('td[data-th="ID"]').textContent;
    document.getElementById('edit-product_name').value = highlightedRow.querySelector('td[data-th="Name"]').textContent;
    document.getElementById('edit-price').value = highlightedRow.querySelector('td[data-th="Price"]').textContent;

    var categoryText = highlightedRow.querySelector('td[data-th="Category"]').textContent;
    document.getElementById('edit-category').value = categoryText === 'Slice Cake' ? 'sc' : categoryText === 'Cupcake' ? 'cc' : 'md';

    var quantityText = highlightedRow.querySelector('td[data-th="Quantity"]').textContent;
    document.getElementById('edit-qtystocks').value = parseInt(quantityText, 10);

    document.getElementById('edit-description').value = highlightedRow.querySelector('td[data-th="Description"]').textContent;

    // Show the edit product modal
    editProductModal.classList.add('show');
}
// Select the close button in the edit product modal
var closeEditProductButton = document.querySelector('.edit-product-modal .close-button');

// Add event listener to the close button in the edit product modal
closeEditProductButton.addEventListener('click', closeEditProductModal);

function closeEditProductModal() {
    // Select the edit product modal
    var editProductModal = document.querySelector('.edit-product-modal');

    // Hide the edit product modal
    editProductModal.classList.remove('show');
}


