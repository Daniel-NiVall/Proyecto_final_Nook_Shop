'use strict'

// Se importan las funciones para gestionar el menu, favoritos y el carrito
import { manageMenu } from './menu.js';
import { updateFavouriteCount, manageFavourites, manageFavIcon, favourites, updateCartCount, manageCart } from './storage.js';

/*
----------------------------------------
product.js
    Interacciones (solo para pagina product.html):
    - Mostrar la informacion del producto seleccionado
    - Añadir la rebaja, los colores y las tallas disponibles
    - Gestionar favoritos, carrito y sugerencias
    - Controlar la visualizacion del header
    - Hacer fetch
    Estructura:
    - Variables
    - Constantes
    - Funciones
    - Invocacion de las funciones
----------------------------------------
*/

(() => {

    // Variables
    // Se obtiene la informacion del producto seleccionado
    // Con ayuda de la IA
    const params = new URLSearchParams(location.search)
    const id = params.get(`id`)

    // Variables para la modificacion del head del DOM
    const meta = document.querySelector(`meta[name=title]`)

    // Se seleccionan las breadcrumbs y el espacio donde ira el producto seleccionado
    const initialBreadcrumb = document.querySelector(`.Initial`)
    const endBreadcrumb = document.querySelector(`.Breadcrumb-h1`)
    const productPage = document.querySelector(`.Product`)


    // Variables para mostrar / ocultar el header
    const header = document.querySelector(`.Header`)
    let scroll = window.scrollY



    // Funciones
    /**
     * Genera la visualizacion del producto seleccionado
     *      - Crea el contenido principal de la pagina con imagen, descripcion, precio y botones
     *      - Actualiza breadcrumbs, titulo y meta title segun el producto
     *      - Invoca las funciones auxiliares de rebaja, tallas, colores e interacciones
     * 
     * @function    createProductPage
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const createProductPage = (productInfo) => {
        // Genera la ruta de localizacion del producto
        initialBreadcrumb.innerHTML = `${productInfo.category}`
        initialBreadcrumb.href = `./category.html?id=${productInfo.category}`
        initialBreadcrumb.title = `${productInfo.category}`
        endBreadcrumb.innerHTML = `${productInfo.name}`
        // Cambia el titulo del documento según el producto seleccionado
        document.title = `${productInfo.name} | Nook Shop`
        meta.setAttribute(`content`, `${productInfo.name} | Nook SHop`)
        // Genera el contenido del producto
        // En el boton de añadir a favoritos el title se añade dinamicamente dentro de la funcion addButtonsInteractions ya que el contenido puede variar
        productPage.innerHTML = `
        <h2 class="Product-name">${productInfo.name}</h2>
        <div class="Product-col Image">
            <img loading="lazy" src="${productInfo.colors[0].srcUpscaled}" alt="${productInfo.name}" class="Product-img">
        </div>
        <div class="Product-col Info">
            <p class="Product-p Description">${productInfo.description}</p>
            <div class="Product-price productPrice">
                <span class="productPrice-original">${productInfo.price}</span>
                <img loading="lazy" src="./assets/iconos/moneda-baya.webp" alt="bayas" class="productPrice-img">
            </div>
            <div class="Product-buttons">
                <button class="Product-button Button Button-fav">
                    <div class="Button-icons Icons">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Icon-favourite Icon-favourite--outline" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Icon-favourite Icon-favourite--fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                        </svg>
                    </div>
                    <span class="Button-span Fav-span">Añadir a favoritos</span>
                </button>
                <button title="Añadir al carrito ${productInfo.name}" class="Product-button Button Button-cart">
                    <div class="Button-icons Icons">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Cart-svg Cart-svg--plus" viewBox="0 0 16 16">
                            <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/>
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                        </svg>
                    </div>
                    <span class="Button-span Cart-span">Añadir al carro</span>
                </button>
                <p class="Product-alert">Por favor selecciona primero una talla</p>
                <a href="./cart.html" class="Product-a Button Button-transaction">Tramitar pedido</a>
            </div>
            `
        // Invoca la funcion que añade la rebaja
        addSale(productInfo)
        // Invoca la funcion que añade el tamaño
        addSize(productInfo)
        // Invoca la funcion que añade los colores
        addColors(productInfo, productPage)
        // Invoca la funcion que da interaccion a los botones de favorito y carrito
        addButtonsInteractions(productInfo)
    }





    /**
     * Comprueba que el producto este rebajado y adapta el precio
     *      - Si no esta rebajado no hace nada
     *      - Si esta rebajado añade el precio rebajado y tacha el original
     * 
     * @function    addSale
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const addSale = (productInfo) => {
        // Si está rebajado crea un span que contendrá el texto de la rebaja, lo situa despues del precio original, añade el precio rebajado y tacha el original
        if (productInfo.sale > 0 && productInfo.sale < 100) {
            const originalPrice = productPage.querySelector(`.productPrice-original`)
            const salePrice = document.createElement(`span`)

            salePrice.classList.add(`productPrice-sale`)
            originalPrice.insertAdjacentElement("afterend", salePrice)
            salePrice.innerHTML = `
            ${productInfo.price - (productInfo.price * (productInfo.sale / 100))}`
            originalPrice.classList.add(`hasSale`)
        }
    }





    /**
     * Añade el tamaño o tamaños del producto
     *      - Si el producto tiene varias tallas crea una lista de botones seleccionables
     *      - Si el producto tiene un unico tamaño lo muestra como texto
     * 
     * @function    addSize
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const addSize = (productInfo) => {
        // Si el producto tiene tamaño (string o array diferente a null)
        // Crea un wrapper y un span y añade el span dentro del wrapper
        // El span albergará el texto que indica talla o tamaño
        // Se selecciona la ubicacion (antes del precio)
        // Detecta si el tamaño es un array o un string
        // Si es un array por cada elemento del array crea un li donde y dentro de li un button. Dentro del button se indica el tamaño (S, M, L)
        // Si es un string se crea un span donde se añade el string
        // Se añaden los elementos creados al wrapper
        // Se añade el wrapper a la visualizaciond el producto, antes del precio
        // Si el tamaño es mayor a 1 (es decir, son tallas S, M, L) se hacen seleccionables y se añade interaccion a cada una
        if (productInfo.size !== null) {
            const productSizes = document.createElement(`div`)
            const productSizesText = document.createElement(`span`)
            const location = productPage.querySelector(`.productPrice`)

            productSizes.classList.add(`Product-sizes`, `Sizes`)
            productSizesText.classList.add(`Sizes-span`)
            productSizes.appendChild(productSizesText)

            if (productInfo.size.length > 1) {
                const sizesList = document.createElement(`ul`)
                sizesList.classList.add(`Sizes-ul`)
                productSizes.appendChild(sizesList)
                productSizesText.innerHTML = `Tallas:`
                for (const talla of productInfo.size) {
                    const productSize = document.createElement(`li`)
                    productSize.classList.add(`Product-li`, `Sizes-li`, `Size`)
                    productSize.innerHTML = `
                    <button type="button" class="Size-button" title="Talla ${talla}" aria-lable="Talla ${talla}">${talla}</button>`
                    sizesList.appendChild(productSize)
                }

                const sizeAlert = document.createElement(`p`)
                sizeAlert.classList.add(`Product-alert`)
                sizeAlert.innerHTML = `Por favor selecciona primero una talla`

                productSizes.appendChild(sizeAlert)
            } else {
                productSizesText.innerHTML = `Tamaño:`

                const productSize = document.createElement(`span`)
                productSize.classList.add(`Sizes-span`, `Size`)
                productSize.innerHTML = `${productInfo.size[0]}`
                productSizes.appendChild(productSize)
            }
            location.insertAdjacentElement("beforebegin", productSizes)
            if (productInfo.size.length > 1) {
                addSizesInteraction()
            }
        }
    }





    /**
     * Añade la interaccion a los tamaños
     *      - Marca como seleccionado el boton pulsado
     *      - Desmarca el resto de tallas
     * 
     * @function    addSizesInteraction
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const addSizesInteraction = () => {
        // Selecciona todas las tallas y les añade eventListener
        const productSizeButtons = document.querySelectorAll(`.Size-button`)
        productSizeButtons.forEach((button) => {
            button.addEventListener(`click`, () => {
                productSizeButtons.forEach((_, i) => {
                    productSizeButtons[i].classList.remove(`isSelected`)
                })
                button.classList.add(`isSelected`)
            })
        })
    }





    /**
     * Añade los colores al producto
     *      - Si el producto tiene mas de un color crea la lista de colores
     *      - Añade la interaccion necesaria para cambiar la imagen segun el color
     * 
     * @function    addColors
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const addColors = (productInfo) => {
        // Se obtiene la cantidad de colores que tiene el producto
        // Si es mayor que 1
        // Se crean los elementos que contendran los colores, se les da clase y se añaden antes del precio
        // Se le añade interactividad a cada color
        const productColorSum = productInfo.colors.length
        if (productColorSum > 1) {
            const productColors = document.createElement(`div`)
            const productColorsText = document.createElement(`span`)
            const colorsList = document.createElement(`ul`)
            const location = productPage.querySelector(`.productPrice`)

            productColors.classList.add(`Product-colors`, `Colors`)
            productColorsText.classList.add(`Colors-span`)
            colorsList.classList.add(`Colors-ul`)

            productColors.appendChild(productColorsText)
            productColors.appendChild(colorsList)
            productColorsText.innerHTML = `Colores:`

            for (const color of productInfo.colors) {
                const productColor = document.createElement(`li`)
                productColor.classList.add(`Product-li`, `Colors-li`, `Color`)
                productColor.innerHTML = `
                <button type="button" class="Color-button" title="Color ${color.color}" aria-label="Color ${color.color}"></button>`
                const productColorBtn = productColor.querySelector(`.Color-button`)
                productColorBtn.style.backgroundColor = color.code
                colorsList.appendChild(productColor)
            }
            location.insertAdjacentElement("beforebegin", productColors)
        }
        addColorsInteraction(productInfo)
    }





    /**
     * Añade la interaccion a los colores
     *      - Marca el color seleccionado y desmarca el resto
     *      - Actualiza la imagen principal con el color elegido
     * 
     * @function    addColorsInteraction
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const addColorsInteraction = (productInfo) => {
        // Selecciona todos los colores y les añade eventListener
        const productColorBtns = document.querySelectorAll(`.Color-button`)
        if (productColorBtns.length > 0) {
            productColorBtns.forEach((button, i) => {
                // Se selecciona el primero por defecto
                productColorBtns[0].classList.add(`isSelected`)
                button.addEventListener(`click`, () => {
                    productColorBtns.forEach((_, j) => {
                        productColorBtns[j].classList.remove(`isSelected`)
                    })
                    button.classList.add(`isSelected`)
                    updateImage(productInfo, i)
                })
            })
        }
    }





    /**
     * Actualiza la imagen al seleccionar un color
     * 
     * @function    updateImage
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Number}        index           Indice del color seleccionado
     * @return      {void} No devuelve ningun valor
     */
    const updateImage = (productInfo, index) => {
        const image = document.querySelector(`.Product-img`)
        let imageSrc = productInfo.colors[index].src
        if (image.classList.contains(`Product-img`)) {
            if (productInfo.colors[index].srcUpscaled) {
                imageSrc = productInfo.colors[index].srcUpscaled
            } else {
                imageSrc = productInfo.colors[index].src
            }
        } else {
            imageSrc = productInfo.colors[index].src
        }
        image.src = imageSrc
    }





    /**
     * Crea las interacciones para los botones de favorito y de compra
     *      - Gestiona el estado de favoritos del producto
     *      - Comprueba talla y color seleccionados antes de añadir al carrito
     * 
     * @function    addButtonsInteractions
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const addButtonsInteractions = (productInfo) => {
        const favButton = document.querySelector(`.Button-fav`)
        let favSpan = favButton.querySelector(`.Fav-span`)
        const favIcon = favButton.querySelector(`.Icon-favourite--fill`)
        const cartButton = document.querySelector(`.Button-cart`)

        // Detecta si el producto esta en el array Favourites
        // Si no esta
        // Icono outlined + texto "Añadir a favoritos"
        // Si esta
        // Icono filled color rojo + texto "Eliminar de favoritos"
        const detectFavourite = () => {
            if (favourites.find(favourite => favourite.id === productInfo.id)) {
                favSpan.innerText = `Eliminar de favoritos`
                favButton.title = `Eliminar de favoritos ${productInfo.name}`
                favButton.classList.add(`isFavourite`)
                favIcon.classList.add(`isFavourite`)
            } else {
                favSpan.innerText = `Añadir a favoritos`
                favButton.classList.remove(`isFavourite`)
                favIcon.classList.remove(`isFavourite`)
                favButton.title = `Añadir a favoritos ${productInfo.name}`
            }
        }

        // Al cargarse el producto se detecta si esta en el array de favoritos o no
        // Se le añade eventListener al boton de añadir / quitar de favoritos
        detectFavourite()
        favButton.addEventListener(`click`, () => {
            manageFavourites(productInfo)
            manageFavIcon(productInfo, favIcon)
            updateFavouriteCount()
            detectFavourite()
        })

        // Se inicializan las variables para las tallas y los colores seleccionados
        let colorIndex
        let sizeIndex

        // readSize y readColors aplican eventListeners a los botones de las tallas y los colores
        // Actualizan el indice segun el seleccionado (el que tiene la clase isSelected)
        const readSize = () => {
            const sizes = document.querySelectorAll(`.Size-button`)
            if (sizes.length < 3) {
                sizeIndex = null
            } else {
                sizes.forEach((size, i) => {
                    size.addEventListener(`click`, () => {
                        if (size.classList.contains(`isSelected`)) {
                            sizeIndex = i
                        }
                    })
                })
            }
        }
        const readColor = () => {
            const colors = document.querySelectorAll(`.Color-button`)
            if (colors.length < 2) {
                colorIndex = 0
            } else {
                colors.forEach((color, i) => {
                    if (color.classList.contains(`isSelected`)) {
                        colorIndex = i
                    }
                })
            }
        }

        // Se añade eventListener al boton de añadir al carrito
        // Si no hay talla o color seleccionado salta una advertencia
        // Si esta todo correcto añade el producto con la talla y el color seleccionado al carrito
        readSize()
        readColor()
        cartButton.addEventListener(`click`, () => {
            readSize()
            readColor()
            const alert = document.querySelector(`.Product-alert`)
            const transactionButton = document.querySelector(`.Button-transaction`)
            const sizes = document.querySelector(`.Sizes`)
            if (sizeIndex === undefined || colorIndex === undefined) {
                alert.classList.add(`isVisible`)
                transactionButton.classList.remove(`isVisible`)
            } else {
                alert.classList.remove(`isVisible`)
                transactionButton.classList.add(`isVisible`)
                manageCart(productInfo, colorIndex, sizeIndex)
                updateCartCount()
            }
        })
    }





    /**
     * Añade sugerencias al producto seleccionado
     *      - Busca productos relacionados en el JSON
     *      - Crea la seccion de sugerencias y rellena sus cards
     * 
     * @function    addSuggestions
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Array}         data            Array completo de productos del JSON
     * @return      {void} No devuelve ningun valor
     */
    const addSuggestions = (productInfo, data) => {
        // Selecciona los id de la coleccion del producto
        // collections es un array que agrupa id de otros productos relacionados con ese
        const suggestedProducts = productInfo.collections

        // Si hay productos sugeridos crea en el DOM la seccion que contendra las sugerencias
        if (suggestedProducts.length > 0) {
            const fragment = document.createDocumentFragment()
            const main = document.querySelector(`main`)
            const suggestions = document.createElement(`section`)

            suggestions.classList.add(`Suggestions`)
            suggestions.innerHTML = `
        <h3 class="Suggestions-h3">Productos sugeridos</h3>
        <p class="Suggestions-p">Como sabemos que tienes buen gusto hemos seleccionado los productos ideales para tí.</p>
        <div class="Suggestions-container">
            <ul class="Suggestions-ul"></ul>
        </div>
        `
            // Se busca en el json el producto que coincide con el id de la sugerencia y se crea la card de ese producto
            const location = suggestions.querySelector(`.Suggestions-ul`)
            suggestedProducts.forEach(product => {
                if (data.find(suggestion => suggestion.id === product)) {
                    const index = data.findIndex(suggestion => suggestion.id === product)
                    createCard(data[index], location)
                }
            })

            fragment.appendChild(suggestions)
            main.appendChild(fragment)
        }
    }





    /**
     * Crea las cards de las sugerencias
     *      - Genera una card para cada producto relacionado
     *      - Reutiliza la misma estructura visual que el resto del listado
     * 
     * @function    createCard
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       location        Ubicacion donde se añade la card
     * @return      {void} No devuelve ningun valor
     */
    const createCard = (productInfo, location) => {
        // Por cada elemento con new o popular = true crea un div que sera la card que contendra la informacion del porducto, le da clase y agrega el contenido
        // En la card siempre habrá por defecto la imagen del producto, el nombre del producto, el precio del producto y el icono de la moneda
        // Tambien se incluye por defecto los botones de favorito y carrito
        // Des pues se incluyen en funcion de si tiene o no la rebaja y los colores
        const fragment = document.createDocumentFragment()
        const productCard = document.createElement(`li`)
        productCard.classList.add(`Card-li`, `Card`)
        productCard.innerHTML = `
    <article class="Card-article">
        <a href="product.html?id=${productInfo.id}" title="" class="Card-a">
            <picture class="Card-picture">
                <source class="Card-source" srcset="${productInfo.colors[0].src}" media="(max-width: 700px)">
                <img loading="lazy" src="${productInfo.colors[0].srcUpscaled}" alt="${productInfo.name}" class="Card-img">
            </picture>
            <div class="Card-info Info">
                <h4 class="Info-h4 Name">${productInfo.name}</h4>
                <div class="Info-price Price">
                    <span class="Price-original">${productInfo.price}</span>
                    <img loading="lazy" src="./assets/iconos/moneda-baya.webp" alt="Bayas" class="Price-img">
                </div>
            </div>
        </a>
        <div class="Card-ctas">
            <button class="Card-cta Card-cta--fav Favourite" title="Botón favorito ${productInfo.name}" aria-label="Botón favorito ${productInfo.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Favourite-svg Favourite-svg--outline" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Favourite-svg Favourite-svg--fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                    </svg>
            </button>
            
        </div>
    </article>
    `
        // Añade la card del producto al carrusel de new o de popular
        fragment.appendChild(productCard)
        location.appendChild(fragment)

        // Cambia el TITLE de cada Card-a y añade el color de la primera imagen
        // Puede ser que el producto solo tenga un color por lo que tiene que pasar una comprobacion
        const cardLink = productCard.querySelector(`.Card-a`)
        if (productInfo.colors.length > 1) {
            cardLink.title = `${productInfo.name} - ${productInfo.colors[0].color}`
        } else {
            cardLink.title = `${productInfo.name}`
        }

        // Añade en la Card la rebaja si es que tiene y los colores disponibles para el producto si es que tiene
        addSaleCard(productInfo, productCard)
        addColorsCard(productInfo, productCard)

        // Funciones para el boton de favorito
        const favouriteBtn = productCard.querySelector(`.Favourite`)
        const favouriteSvg = productCard.querySelector(`.Favourite-svg--fill`)

        // Primero al cargar la pagina lee el localStorage para actualizar la visualizacion del icono
        manageFavIcon(productInfo, favouriteSvg)
        updateFavouriteCount()
        updateCartCount()


        // Añade eventListeners para cuando se clican
        // Lee si el producto esta almacenado en localStorage
        // Si esta almacenado lo quita y si no lo añade
        // Actualiza la visualizacion del icono
        favouriteBtn.addEventListener(`click`, () => {
            manageFavourites(productInfo, favouriteSvg)
            manageFavIcon(productInfo, favouriteSvg)
            updateFavouriteCount()
        })


        // Elimina focus de los botones al salir del hover para que los elementos vuelvan a su posición inicial
        productCard.addEventListener(`mouseleave`, () => {
            if (document.activeElement === favouriteBtn) {
                // .blur() fuerza que el elemento deje de estar activo
                document.activeElement.blur()
            }
        })
    }





    /**
     * Comprueba que el producto sugerido este rebajado y adapta el precio
     *      - Si no esta rebajado no hace nada
     *      - Si esta rebajado añade el precio rebajado y tacha el original
     * 
     * @function    addSaleCard
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addSaleCard = (productInfo, productCard) => {
        // Si está rebajado crea un span que albergará el texto de la rebaja, lo situa antes del precio original, añade el precio rebajado y tacha el original
        if (productInfo.sale > 0 && productInfo.sale < 100) {
            const originalPrice = productCard.querySelector(`.Price-original`)
            const salePrice = document.createElement(`span`)
            salePrice.classList.add(`Price-sale`)
            originalPrice.insertAdjacentElement("afterend", salePrice)
            salePrice.innerHTML = `
            ${productInfo.price - (productInfo.price * (productInfo.sale / 100))}`
            originalPrice.classList.add(`hasSale`)
        }
    }





    /**
     * Comprueba que el producto sugerido tenga colores disponibles
     *      - Si tiene, crea la lista y permite cambiar la imagen al pasar por cada color
     *      - Si no tiene mas de un color no hace nada
     * 
     * @function    addColorsCard
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addColorsCard = (productInfo, productCard) => {
        const productColorSum = productInfo.colors.length
        const prodcutWrapper = productCard.querySelector(`.Card-article`)
        const image = productCard.querySelector(`.Card-img`)
        const picture = productCard.querySelector(`.Card-source`)
        const cardLink = productCard.querySelector(`.Card-a`)
        let currentColorIndex = 0

        // Actualiza la imagen visualizada segun el color
        const updateImage = (index) => {
            const windowWidth = window.innerWidth

            const pictureMedia = Number(picture.media.substring("12", "15"))
            if (windowWidth > pictureMedia) {
                image.src = productInfo.colors[index].srcUpscaled
            } else {
                picture.srcset = productInfo.colors[index].src
            }

            if (productInfo.colors.length > 1) {
                cardLink.title = `${productInfo.name} - ${productInfo.colors[index].color}`
            } else {
                cardLink.title = `${productInfo.name}`
            }
            currentColorIndex = index
        }
        // Si el producto tiene mas de un color crea la lista de colores
        if (productColorSum > 1) {
            const fragment = document.createDocumentFragment()
            const productColors = document.createElement(`ul`)
            productColors.classList.add(`Card-colors`)
            // Por cada color crea un item de la lista
            // Le asigna la clase Color
            // Le asigna el color de fondo correspondiente
            productInfo.colors.forEach((color, i) => {
                const productColor = document.createElement(`li`)
                productColor.classList.add(`Card-color`, `Color`)
                productColors.appendChild(productColor)
                productColor.style.backgroundColor = color.code

                // Añade eventListners para hover y focus
                productColor.addEventListener(`mouseover`, () => { updateImage(i) })
                productColor.addEventListener(`focus`, () => { updateImage(i) })
            })
            // Añade la lista de colores a la card
            fragment.appendChild(productColors)
            prodcutWrapper.appendChild(fragment)

            // Añade eventListeners para que cuando se salga de la card la imagen vuelva a la predeterminada
            productCard.addEventListener('focusout', (e) => {
                if (!productCard.contains(e.relatedTarget)) {
                    updateImage(0)
                }
            })
        }
    }





    /**
     * Configura un IntersectionObserver para mostrar u ocultar los iconos y colores de las cards en mobile
     *      - En mobile observa cada card y aplica la clase isVisible cuando entra en pantalla
     *      - En desktop desconecta el observador y restaura el estado predeterminado
     * 
     * @function    setIntersectionObserverCard
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const setIntersectionObserverCard = () => {
        // Opciones del observador
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        // Se inicializa el observador
        let observer = null;

        const setupObserver = () => {
            // Solo debe funcionar en Mobile
            const card = document.querySelectorAll(`.Card`)
            if (window.innerWidth < 850) {
                if (observer) {
                    // Previene duplicaciones del observer
                    observer.disconnect();
                }
                // Se define el observador
                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        // Se seleccionan los elementos que se van a animar
                        const cardIcons = entry.target.querySelector('.Card-ctas');
                        const cardColors = entry.target.querySelector('.Card-colors');
                        // Al verse en pantalla se añade la clase isVisible
                        // Al salir se le quita la clase isVisible
                        if (entry.isIntersecting) {
                            if (cardIcons) {
                                cardIcons.classList.add('isVisible');
                            }
                            if (cardColors) {
                                cardColors.classList.add('isVisible');
                            }
                        } else {
                            if (cardIcons) {
                                cardIcons.classList.remove('isVisible');
                            }
                            if (cardColors) {
                                cardColors.classList.remove('isVisible');
                            }
                        }
                    });
                }, observerOptions);

                card.forEach(card => {
                    observer.observe(card);
                });
            } else {
                if (observer) {
                    // Si hay un observador lo quita
                    observer.disconnect();
                }
                // Quita la clase isVisible para que vuelvan al estado predeterminado al salir de Mobile
                card.forEach((_, i) => {
                    const cardIcons = card[i].querySelector('.Card-ctas');
                    const cardColors = card[i].querySelector('.Card-colors');

                    if (cardIcons) {
                        cardIcons.classList.remove('isVisible');
                    }
                    if (cardColors) {
                        cardColors.classList.remove('isVisible');
                    }
                })
            }
        };
        // Ejecutar al cargar
        setupObserver();
        // Reejecutar al redimensionar
        window.addEventListener('resize', setupObserver);
    }





    /**
     * Funcion que oculta o muestra el header según el scroll del usuario
     * Si el usuario hace scroll hacia abajo se oculta el header
     * Si el usuario hace scroll hacia arriba se muestra el header
     * 
     * 
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    window.addEventListener(`scroll`, () => {
        // Al hacer scroll se obtiene el scroll realizado
        const newScroll = window.scrollY

        // Se compara el scroll nuevo con el scroll obtenido inicialmente
        // Si el scroll nuevo es mayor que el inicial se esta desplazando hacia abajo por lo que se oculta el header
        if (newScroll > scroll) {
            header.classList.remove(`isVisible`)
        }
        // Si el scroll nuevo es menor que el inicial se esta desplazando hacia arriba por lo que se muestra el header
        else if (newScroll < scroll) {
            header.classList.add(`isVisible`)
        }

        // Se actualiza la variable scroll dandole el valor del scroll nuevo para futuras comparaciones
        scroll = newScroll
    })


    let controller = new AbortController()
    let options = {
        method: `get`,
        signal: controller.signal
    }
    /**
     * Obtiene los productos del JSON y construye la pagina del producto seleccionado
     *      - Busca el producto que coincide con el id de la URL
     *      - Genera la pagina principal, las sugerencias y las animaciones necesarias
     * 
     * @author      DanielNiceto
     * @url         {@link ./productos/productos.json}
     * @return      {void} No devuelve ningun valor
     */
    fetch(`./productos/productos.json`, options)
        .then(response => response.json())
        .then(data => {

            data.forEach(product => {
                if (product.id === id) {
                    // Si el id de algun producto del JSON coincide con el id del articulo seleccionado en index.html
                    // Se ejecuta la funcion que genera la visualizacion para ese producto     
                    createProductPage(product)
                    addSuggestions(product, data)
                }
            })
            setIntersectionObserverCard()
        })
        .catch(error => console.error(`Error:`, error))
        .finally(() => {
            controller.abort()
        })

    // Se invocan las funciones importadas de menu.js y storage.js
    manageMenu()
    updateFavouriteCount()
    updateCartCount()
})()
