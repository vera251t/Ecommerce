async function getProducts() {
    try {
        const data = await fetch('https://ecommercebackend.fundamentos-29.repl.co/');

        const res = await data.json();

        window.localStorage.setItem("products", JSON.stringify(res));

        return res;
    } catch (error) {
        console.log(error);
    }
}

window.addEventListener("load", function () {
    setTimeout(function () {
        const contentLoadingHTML = document.querySelector(".loading");
        contentLoadingHTML.classList.add("loading__none");
    }, 1000);
});


function animationScroll() {
    const headerHMTL = document.querySelector("header");
    const navHMTL = document.querySelector("nav");
    let y = window.scrollY;

    if (y > 200) {
        headerHMTL.classList.add("navbar--scroll");
        navHMTL.classList.add("scroll");
    } else {
        headerHMTL.classList.remove("navbar--scroll");
        navHMTL.classList.remove("scroll");
    }
}
window.onscroll = () => animationScroll();

function dark() {
    let toggle = document.getElementById("toggle");
    let label_toggle = document.getElementById("label_toggle");
    let isDark = localStorage.getItem("darkMode") === "true";

    function updateDarkMode() {
        let checked = toggle.checked;
        document.body.classList.toggle("dark", checked);
        label_toggle.innerHTML = checked ? `<i class='bx bx-sun'></i>` : `<i class='bx bx-moon'></i>`;
        localStorage.setItem("darkMode", checked);
    }

    toggle.checked = isDark;
    updateDarkMode();

    toggle.addEventListener("click", updateDarkMode);
}

function printProducts(db) {
    const productsHTML = document.querySelector(".products");

    let html = "";

    for (const { quantity, category, id, image, name, price } of db.products) {

        const buttomAdd = quantity
            ? `<i class='bx bx-plus' id='${id}'></i>`
            : "<span class='soldOut'>sold out</span>"
        html += `
        <div class="product ${category}">
            <div class="product__img">
                <img src="${image}" alt="imagen" />
            </div>

            <div class="product__info">
                <h4 id="${id}">${name} | <span><b>Stock</b>: ${quantity}</span></h4>
                <h5>
                    $${price}
                    ${buttomAdd}
                </h5>
            </div>

        </div>
        `;
    }

    console.log(html);

    productsHTML.innerHTML = html;
}

function PrintModal() {
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-content');
    document.body.appendChild(modalContainer);

    const products = document.querySelectorAll('.product');

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = product.querySelector('h4').getAttribute('id');
        const productName = product.querySelector('h4').innerText;
        const productPrice = product.querySelector('h5').innerText;
        const productImage = product.querySelector('img').getAttribute('src');
        const productNameElement = product.querySelector('h4');
    
        productNameElement.addEventListener('click', () => {
            let html = `
              <div class="modal" id="${productId}">
                <i class='bx bx-x-circle close-icon'></i>
                <img src="${productImage}" alt="imagen">
                <h3 class="product-info">${productName}</h3>
                <p class="product-info">${productPrice}</p>
                <i class='plus bx bx-plus'></i>
              </div>
            `;
            modalContainer.innerHTML = html;
    
            modalContainer.classList.add('show');

            const closeIcon = modalContainer.querySelector('.close-icon');
            closeIcon.addEventListener('click', () => {
              modalContainer.classList.remove('show');
            });
        });
    }  
}

function handleMixtup() {
    mixitup(".products", {
        selectors: {
            target: ".product",
        },
        animation: {
            duration: 300,
        },
    });
}

function handleShowCart() {
    const iconCartHTML = document.querySelector(".bx-shopping-bag");
    const cartHTML = document.querySelector(".cart");

    iconCartHTML.addEventListener("click", function () {
        cartHTML.classList.toggle("cart__show");
    });
}

function addToCartFromProducts(db) {
    const productsHTML = document.querySelector(".products");

    productsHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.id);

            const productFind = db.products.find(
                (product) => product.id === id
            );

            if (db.cart[productFind.id]) {
                if (productFind.quantity === db.cart[productFind.id].amount)
                    return alert("No tenemos mas en bodega");

                db.cart[productFind.id].amount++;
            } else {
                db.cart[productFind.id] = { ...productFind, amount: 1 };
            }

            window.localStorage.setItem("cart", JSON.stringify(db.cart));
            printProductsInCart(db);
            printTotal(db);
            handlePrintAmountProducts(db);
        }
    });
}

function printProductsInCart(db) {
    const cartProducts = document.querySelector(".cart__products");

    let html = "";

    for (const product in db.cart) {
        const { quantity, price, name, image, id, amount } = db.cart[product];

        html += `
            <div class="cart__product">
                <div class="cart__product--img">
                    <img src="${image}" alt="${name}" />
                </div>
                <div class="cart__product--body">
                    <h4>${name} | $${price}</h4>
                    <p>Stock: ${quantity}</p>

                    <div class="cart__product--body-op" id="${id}">
                        <i class='bx bx-minus'></i>
                        <span>${amount} unit</span>
                        <i class='bx bx-plus'></i>
                        <i class='bx bx-trash-alt'></i>
                        <!--<i class='bx bx-trash'></i>-->
                    </div>
                </div>
            </div>
        `;
    }

    cartProducts.innerHTML = html;
}

function handleProductsInCart(db) {
    const cartproducts = document.querySelector(".cart__products");

    cartproducts.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const id = Number(e.target.parentElement.id);

            const productFind = db.products.find(
                (product) => product.id === id
            );
            if (productFind.quantity === db.cart[productFind.id].amount)
                return alert("No tenemos mas en bodega");
            db.cart[id].amount++;
        }

        if (e.target.classList.contains("bx-minus")) {
            const id = Number(e.target.parentElement.id);
            if (db.cart[id].amount === 1) {
                const response = confirm(
                    "Estas seguro de que quieres eliminar este producto?"
                );
                if (!response) return;
                delete db.cart[id];
            } else {
                db.cart[id].amount--;
            }
        }

        if (e.target.classList.contains("bx-trash-alt")) {
            const id = Number(e.target.parentElement.id);
            const response = confirm(
                "Estas seguro de que quieres eliminar este producto?"
            );
            if (!response) return;
            delete db.cart[id];
        }

        window.localStorage.setItem("cart", JSON.stringify(db.cart));
        printProductsInCart(db);
        printTotal(db);
        handlePrintAmountProducts(db);
    });
}

function printTotal(db) {
    const infoTotal = document.querySelector(".info__total");
    const infoAmount = document.querySelector(".info__amount");

    let totalProducts = 0;
    let amountProducts = 0;

    for (const product in db.cart) {
        const { amount, price } = db.cart[product];
        totalProducts += price * amount;
        amountProducts += amount;
    }

    infoAmount.textContent = amountProducts + " units";
    infoTotal.textContent = "$" + totalProducts + ".00";
}

function handleTotal(db) {
    const btnBuy = document.querySelector(".btn__buy");

    btnBuy.addEventListener("click", function () {
        if (!Object.values(db.cart).length)
            return alert("Pero tienes que tener algo en el carrito, no?");

        const response = confirm("Seguro que quieres comprar?");
        if (!response) return;

        const currentProducts = [];

        for (const product of db.products) {
            const productCart = db.cart[product.id]
            if (product.id === productCart?.id) {
                currentProducts.push({
                    ...product,
                    quantity: product.quantity - productCart.amount
                });
            } else {
                currentProducts.push(product);
            }
        }

        db.products = currentProducts;
        db.cart = {}

        window.localStorage.setItem("products", JSON.stringify(db.products));
        window.localStorage.setItem("cart", JSON.stringify(db.cart));

        printTotal(db);
        printProductsInCart(db);
        printProducts(db);
        handlePrintAmountProducts(db);

        window.location.reload();
    });
}

function handlePrintAmountProducts(db) {
    const amountProducts = document.querySelector(".amountProducts");

    let amount = 0;

    for (const product in db.cart) {
        amount += db.cart[product].amount;
    }

    amountProducts.textContent = amount;
}

async function main() {
    const db = {
        products:
            JSON.parse(window.localStorage.getItem("products")) ||
            (await getProducts()),
        cart: JSON.parse(window.localStorage.getItem("cart")) || {},
    }

    printProducts(db);
    handleShowCart();
    addToCartFromProducts(db);
    printProductsInCart(db);
    handleProductsInCart(db);
    printTotal(db);
    handleTotal(db);
    handlePrintAmountProducts(db);
    handleMixtup();
    dark();
    PrintModal();
}

window.addEventListener("load", function () {
    main();
})