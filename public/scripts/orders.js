function convertTo24Hour(time) {
    var [timePart, period] = time.split(' ');
    var [hours, minutes] = timePart.split(':');

    if (period === 'PM' && hours !== '12') {
        hours = Number(hours) + 12;
    } else if (period === 'AM' && hours === '12') {
        hours = '00';
    }

    // Add a leading zero to the hours if it's less than 10
    if (hours < 10) {
        hours = '0' + hours;
    }

    return `${hours}:${minutes}`;
}

window.onload = function() {
    const editLinks = document.querySelectorAll('.transactions-table .edit a, .transaction-control .edit a');
    const editForm = document.querySelector('#editForm');
    const deliveryDateInput = document.querySelector('#deliveryDate');
    const deliveryTimeInput = document.querySelector('#deliveryTime');
    const editOrderIdInput = document.querySelector('#editOrderId');
    const editModal = document.querySelector('#editModal');
    const closeModal = document.querySelector('#editModal .close');

    let rawData = {};

    editLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const transaction = this.closest('.transaction') || this.closest('tr');
            const orderId = this.getAttribute('data-order-id');
            const deliveryDate = this.getAttribute('data-delivery-date');
            const deliveryTime = this.getAttribute('data-delivery-time');

            // Store the raw data in the object
            rawData = { deliveryDate, deliveryTime };

            // Format the date and time values
            const formattedDate = new Date(deliveryDate).toISOString().split('T')[0];
            const formattedTime = convertTo24Hour(deliveryTime);

            deliveryDateInput.value = formattedDate;
            deliveryTimeInput.value = formattedTime;
            editOrderIdInput.value = orderId;

            // Show the modal
            editModal.classList.add('show');
        });
    });

    closeModal.addEventListener('click', function() {
        // Hide the modal
        editModal.classList.remove('show');
    });

    // ...

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const orderId = editOrderIdInput.value;
        const deliveryDate = deliveryDateInput.value;
        const deliveryTime = deliveryTimeInput.value;

        fetch('/orders/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                deliveryDate,
                deliveryTime,
            }),
        })
        .then(response => {
            if (response.ok) {
                // Redirect back to the orders page
                window.location.href = '/orders';
            } else {
                throw new Error('Failed to update order');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}

document.querySelectorAll('.cancel-link').forEach(function(link) {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const orderId = this.dataset.orderId;
        if (confirm('Are you sure you want to cancel this order?')) {
            window.location.href = '/orders/cancel/' + orderId;
        }
    });
});




// Mobile view form functionalities


