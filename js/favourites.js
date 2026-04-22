'use strict'

// Se importan las funciones para gestionar el menu, favoritos y el carrito
import { manageMenu } from "./menu.js";
import { updateCartCount, updateFavouriteCount, favourites } from "./storage.js";

/*
----------------------------------------
favourites.js
    Interacciones (solo para pagina favourites.html):
    - Mostrar la lista de productos favoritos
    - Añadir rebajas, tallas y colores a cada card
    - Permitir eliminar productos de favoritos
    - Ajustar el ancho de las cards y mostrar estado vacio
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
    // Variables para mostrar / ocultar el ehader
    const header = document.querySelector(`.Header`)
    let scroll = window.scrollY

    // Se selecciona el wrapper de los productos y la seccion del estado vacio
    const wrapper = document.querySelector(`.Favourites`)
    const empty = document.querySelector(`.Empty`)


    // Funciones
    /**
     * Actualiza la pagina segun hay o no elementos en favoritos
     *      - Si hay cards oculta el estado vacio
     *      - Si no hay cards muestra el estado vacio
     * 
     * @function    updateEmptyState
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const updateEmptyState = () => {
        const hasCards = wrapper.querySelectorAll(`.Favourite`).length
        if (hasCards > 0) {
            empty.style.display = `none`
        } else {
            empty.style.display = `flex`
        }
    }





    /**
     * Genera la card de un producto favorito y añade sus interacciones
     *      - Crea el contenido de la card y la inserta en la lista
     *      - Añade rebaja, tallas, colores y boton para eliminar
     * 
     * @function    createProductCard
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @return      {void} No devuelve ningun valor
     */
    const createProductCard = (productInfo) => {
        const fragment = document.createDocumentFragment()
        const wrapper = document.querySelector(`.Favourites-ul`)
        const card = document.createElement(`li`)

        card.classList.add(`Favourite-li`, `Favourite`)
        card.innerHTML = `
        <div class="Favourite-wrapper">
            <a href="./product.html?id=${productInfo.id}" title="${productInfo.name}" class="Favourite-a">
                <img src="${productInfo.colors[0].srcUpscaled}" alt="${productInfo.name}" class="Favourite-img">
                <div class="Favourite-info">
                    <h2 class="Favourite-name">${productInfo.name}</h2>                
                    <div class="Favourite-price Price">
                        <span class="Price-original">${productInfo.price}</span>
                        <img loading="lazy" src="assets/iconos/moneda-baya.webp" alt="" class="Price-img">
                    </div>
                </div>
            </a>
            <div class="Favourite-buttons">
                <button class="Favourite-button" title="Eliminar ${productInfo.name}" aria-label="Eliminar ${productInfo.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Delete-icon" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                </button>
            </div>
        </div>`
        fragment.appendChild(card)
        wrapper.appendChild(fragment)

        // Ejecuta la funcion que añade la rebaja al producto
        addSale(productInfo, card)
        // Ejecuta la funcion que añade el tamaño o tamaños al producto
        addSize(productInfo, card)
        // Ejecuta la funcion que añade los colores al producto
        addColors(productInfo, card)

        // Añade eventListener al boton de eliminar del producto
        const deleteButton = card.querySelector(`.Favourite-button`)
        deleteButton.addEventListener(`click`, () => {
            deleteFavourite(productInfo, card)
        })
    }





    /**
     * Comprueba si el producto esta rebajado y adapta el precio
     *      - Si no esta rebajado no hace nada
     *      - Si esta rebajado añade el precio rebajado y tacha el original
     * 
     * @function    addSale
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addSale = (productInfo, productCard) => {
        // Si está rebajado crea un span que contendrá el texto de la rebaja, lo situa despues del precio original, añade el precio rebajado y tacha el original
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
     * Añade el tamaño o tamaños del producto en la card
     *      - Si hay varias tallas crea una lista
     *      - Si hay un unico tamaño lo muestra como texto
     * 
     * @function    addSize
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addSize = (productInfo, productCard) => {
        // Si el producto tiene tamaño (string o array diferente a null)
        // Crea un wrapper y un span y añade el span dentro del wrapper
        // El span albergará el texto que indica talla o tamaño
        // Se selecciona la ubicacion (antes del precio)
        // Detecta si el tamaño es un array o un string
        // Si es un array por cada elemento del array crea un li donde y dentro de li un button. Dentro del button se indica el tamaño (S, M, L)
        // Si es un string se crea un span donde se añade el string
        // Se añaden los elementos creados al wrapper
        // Se añade el wrapper a la visualizaciond el producto, antes del precio
        if (productInfo.size !== null) {
            const productSizes = document.createElement(`div`)
            const productSizesText = document.createElement(`span`)
            const location = productCard.querySelector(`.Price`)

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
                    productSize.classList.add(`Product-li`, `Size`)
                    // productSize.ariaLabel =`Talla ${talla}`
                    productSize.innerHTML = `${talla}`
                    sizesList.appendChild(productSize)
                }
            } else {
                productSizesText.innerHTML = `Tamaño:`

                const productSize = document.createElement(`span`)
                productSize.classList.add(`Sizes-span`, `Size`)
                productSize.innerHTML = `${productInfo.size[0]}`
                productSizes.appendChild(productSize)

            }
            location.insertAdjacentElement("beforebegin", productSizes)
        }
    }





    /**
     * Añade los colores al producto en la card
     *      - Si tiene mas de un color crea la lista de colores
     *      - Inserta la lista antes del precio
     * 
     * @function    addColors
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addColors = (productInfo, productCard) => {
        // Se obtiene la cantidad de colores que tiene el producto
        // Si es mayor que 1
        // Se crean los elementos que contendran los colores, se les da clase y se añaden antes del precio
        const productColorSum = productInfo.colors.length
        if (productColorSum > 1) {
            const productColors = document.createElement(`div`)
            const productColorsText = document.createElement(`span`)
            const colorsList = document.createElement(`ul`)
            const location = productCard.querySelector(`.Price`)

            productColors.classList.add(`Product-colors`, `Colors`)
            productColorsText.classList.add(`Colors-span`)
            colorsList.classList.add(`Colors-ul`)

            productColors.appendChild(productColorsText)
            productColors.appendChild(colorsList)

            productColorsText.innerHTML = `Colores:`
            for (const color of productInfo.colors) {
                const productColor = document.createElement(`li`)
                productColor.classList.add(`Product-li`, `Color`)
                productColor.innerHTML = ``
                productColor.style.backgroundColor = color.code
                colorsList.appendChild(productColor)
            }
            location.insertAdjacentElement("beforebegin", productColors)
        }
    }





    /**
     * Elimina un producto de favoritos y actualiza la interfaz
     *      - Borra el producto del array y del localStorage
     *      - Elimina la card del DOM y actualiza contadores y estado vacio
     * 
     * @function    deleteFavourite
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       card            Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const deleteFavourite = (productInfo, card) => {
        // Encuentra la posicion del producto que se quiere eliminar
        const index = favourites.findIndex(fav => fav.id === productInfo.id)
        if (index === -1) {
            return
        }
        // Quita el producto del array de favoritos
        // Actualiza el almacenamiento local segun el nuevo array
        // Le añade a la card la clase isDeleted
        // Elimina la card del DOM
        // Actualiza el contador de favoritos
        // Actualiza el calculo del ancho de las cards
        // Actualiza la visualizacion sin productos en favoritos por si era el ultimo producto
        favourites.splice(index, 1)
        localStorage.setItem(`favourites`, JSON.stringify(favourites))
        card.classList.add(`isDeleted`)
        card.remove()
        updateFavouriteCount()
        setCardWidths()
        updateEmptyState()
    }





    /**
     * Establece el tamaño de las cards para que todas tengan el mismo ancho
     * 
     * @function    setCardWidths
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const setCardWidths = () => {
        // Se selecciona el wrapper de la lista y las cards
        const wrapper = document.querySelector(`.Favourites`)
        const cards = wrapper.querySelectorAll(`.Favourite-a`)

        // Si no hay cards se elimina la variable de css del ancho y sale de la funcion
        if (cards.length < 1) {
            wrapper.style.removeProperty(`--favourite-base-width`)
            return
        }

        // Se itera cada card, se lee el valor de su ancho y se guarda el mayor ancho en una variable
        // Al final se establece el valor de la variable como el ancho de todas las cards usando la variable de css
        wrapper.style.removeProperty(`--favourite-base-width`)
        let maxWidth = 0
        cards.forEach(card => {
            const cardWidth = Math.ceil(card.getBoundingClientRect().width)
            if (cardWidth > maxWidth) maxWidth = cardWidth
        })
        wrapper.style.setProperty(`--favourite-base-width`, `${maxWidth}px`)
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
     * Obtiene los productos del JSON y crea las cards de favoritos
     *      - Filtra los productos cuyo id esta guardado en favoritos
     *      - Genera cards, ajusta anchos y actualiza el estado vacio
     * 
     * @author      DanielNiceto
     * @url         {@link ./productos/productos.json}
     * @return      {void} No devuelve ningun valor
     */
    fetch(`./productos/productos.json`, options)
        .then(response => response.json())
        .then(data => {

            data.forEach(product => {
                if (favourites.find(favourite => favourite.id === product.id)) {
                    createProductCard(product)
                }
            })
            setCardWidths()
            updateEmptyState()
            window.addEventListener(`resize`, () => {
                setCardWidths()
            })
        })
        .catch(error => console.error(`Error:`, error))
        .finally(() => {
            controller.abort()
        })

    // Se invocan las funciones importadas de menu.js y storage.js
    // Y se comprueba si la lista de favoritos esta vacia o no
    manageMenu()
    updateFavouriteCount()
    updateCartCount()
    updateEmptyState()

})()
