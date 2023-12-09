const closeBtn = document.querySelector('#closeBtn')
const popup = document.querySelector('.popup')
const signInBtns = document.querySelectorAll('#signInBtn');

signInBtns.forEach(signInBtn => {
    signInBtn.addEventListener('click', () => {
        popup.classList.add('active');
    });
});
closeBtn.addEventListener('click', () => {
    popup.classList.remove('active')
})


const signin = document.querySelector('.signin')
const register = document.querySelector('.register')
const signinOrRegister = document.querySelector('#signinOrRegister')

signinOrRegister.addEventListener('click', () => {
    register.classList.toggle('hide');
    signin.classList.toggle('hide');
    signinOrRegister.innerHTML = signinOrRegister.innerHTML === 'Sign In' ? 'Register' : 'Sign In';
});



const categories = document.querySelectorAll('.categories a');

categories.forEach(category => {
    category.addEventListener('click', () => {
        // Remove active class from all categories
        categories.forEach(category => {
            category.classList.remove('active');
        });

        // Add active class to the clicked category
        category.classList.add('active');
    });
});


window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.next-product').forEach(function(button) {
        button.addEventListener('click', function() {
            const currentProduct = button.closest('.product');
            const nextProduct = currentProduct.nextElementSibling;
            
            if (nextProduct) {
                nextProduct.scrollIntoView({behavior: "smooth"});
            }
        });
    });

    document.querySelectorAll('.previous-product').forEach(function(button) {
        button.addEventListener('click', function() {
            const currentProduct = button.closest('.product');
            const previousProduct = currentProduct.previousElementSibling;
            
            if (previousProduct) {
                previousProduct.scrollIntoView({behavior: "smooth"});
            }
        });
    });
});

document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.querySelector('.cart-modal').style.display = 'none';
});

document.querySelector('.cartBtn').addEventListener('click', function() {
    document.querySelector('.cart-modal').style.display = 'flex';
});





document.getElementById('checkout-form').addEventListener('submit', function(e) {
    // Prevent the form from submitting normally
    e.preventDefault();

    // Get the products from the cart
    var products = getProductsFromCart(); // You'll need to implement this function

    // Add a hidden input field for each product
    products.forEach(function(product) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'products[]';
        input.value = JSON.stringify(product);
        this.appendChild(input);
    }, this);

    // Submit the form
    this.submit();
});


function showProfileModal() {
    const profileModal = document.querySelector('.profile-modal');
    profileModal.classList.add('show');
}

document.querySelector('.profileBtn').addEventListener('click', function(event) {
    event.preventDefault();
    showProfileModal();
});

function hideProfileModal() {
    const profileModal = document.querySelector('.profile-modal');
    profileModal.classList.remove('show');
}

document.querySelector('.close-button').addEventListener('click', function(event) {
    event.preventDefault();
    hideProfileModal();
});


function showChangePasswordModal() {
    const changePasswordModal = document.querySelector('.change-password-modal');
    changePasswordModal.classList.add('show');
}

function hideChangePasswordModal() {
    const changePasswordModal = document.querySelector('.change-password-modal');
    changePasswordModal.classList.remove('show');
}

document.querySelector('.change-password-button').addEventListener('click', function(event) {
    event.preventDefault();
    showChangePasswordModal();
});

document.querySelector('.change-password-modal .close-button').addEventListener('click', function(event) {
    event.preventDefault();
    hideChangePasswordModal();
});

document.querySelector('#change-password-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const currentPassword = document.querySelector('#current-password').value;
    const newPassword = document.querySelector('#new-password').value;
    const confirmPassword = document.querySelector('#confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    fetch('/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Password changed successfully');
            hideChangePasswordModal();
            // clear the form
            document.querySelector('#current-password').value = '';
            document.querySelector('#new-password').value = '';
            document.querySelector('#confirm-password').value = '';
        } else {
            alert(data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});


const myAddressRadio = document.querySelector('#my-address');
const anotherAddressRadio = document.querySelector('#another-address');
const deliveryAddressInput = document.querySelector('#delivery-address');

myAddressRadio.addEventListener('change', () => {
    deliveryAddressInput.disabled = true;
});

anotherAddressRadio.addEventListener('change', () => {
    deliveryAddressInput.disabled = false;
});


