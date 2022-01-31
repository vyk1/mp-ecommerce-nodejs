const mp = new MercadoPago('APP_USR-6096a634-0b35-452c-94c9-a18adb8ffb15', {
    locale: 'pt-BR'
});

function createCheckoutButton(preferenceId) {

    mp.checkout({
        preference: {
            id: preferenceId
        },
        render: {
            container: '#button-checkout',
            label: 'Pague a compra',
        }
    });
}

function checkout(el) {

    const orderData = {
        img: el.getAttribute('data-img'),
        title: el.getAttribute('data-title'),
        price: el.getAttribute('data-price')
    }

    el.hidden = true

    fetch("/create-preference", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (preference) {
            createCheckoutButton(preference.id);

            $(".shopping-cart").fadeOut(500);
            setTimeout(() => {
                $(".container_payment").show(500).fadeIn();
            }, 500);
        })
        .catch(function (e) {
            console.log(e);
            el.hidden = false
            alert("Unexpected error");
            $('#checkout-btn').attr("disabled", false);
        })
        .finally(function () {
            el.setAttribute('disabled', true)
        })

}

