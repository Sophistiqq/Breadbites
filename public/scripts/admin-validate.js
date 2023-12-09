window.onload = function () {
    var addUserForm = document.querySelector('#add-user-form');
    var editUserForm = document.querySelector('#edit-user-form');

    addUserForm.addEventListener('submit', function (event) {
        validateForm(event, this);
    });

    editUserForm.addEventListener('submit', function (event) {
        validateForm(event, this);
    });

    // Add event listeners for blur and input events
    var formFields = document.querySelectorAll('#add-user-form input, #edit-user-form input');
    formFields.forEach(function (field) {
        field.addEventListener('blur', function (event) {
            validateForm(event, this.form);
        });

        field.addEventListener('input', function (event) {
            validateForm(event, this.form);
        });
    });
}

function validateForm(event, form) {
    var username = form['username'].value;
    var password = form['password'].value;

    var errorElements = form.querySelectorAll('.error');
    errorElements.forEach(function (errorElement) {
        errorElement.remove();
    });

    if (!/^[\w-]{3,16}$/.test(username)) {
        event.preventDefault();
        form['username'].style.borderColor = 'red';
    } else {
        form['username'].style.borderColor = 'green'; // Change border color to green if valid
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password)) {
        event.preventDefault();
        form['password'].style.borderColor = 'red';
    } else {
        form['password'].style.borderColor = 'green'; // Change border color to green if valid
    }

    if (form['email']) {
        var email = form['email'].value;
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
            event.preventDefault();
            form['email'].style.borderColor = 'red';
        } else {
            form['email'].style.borderColor = 'green'; // Change border color to green if valid
        }
    }

    if (form['contact_number']) {
        var contactNumber = form['contact_number'].value;
        if (!/^\d{10,15}$/.test(contactNumber)) {
            event.preventDefault();
            form['contact_number'].style.borderColor = 'red';
        } else {
            form['contact_number'].style.borderColor = 'green'; // Change border color to green if valid
        }
    }

    if (form['address']) {
        var address = form['address'].value;
        if (!/^[\w ,.-]{1,100}$/.test(address)) {
            event.preventDefault();
            form['address'].style.borderColor = 'red';
        } else {
            form['address'].style.borderColor = 'green'; // Change border color to green if valid
        }
    }
}