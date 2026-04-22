'use strict'

// Se importan las funciones para gestionar el menu, favoritos y el carrito
import { manageMenu } from "./menu.js";
import { updateFavouriteCount, updateCartCount, cart } from "./storage.js";

/*
----------------------------------------
cart.js
    Interacciones (solo para pagina cart.html):
    - Mostrar productos del carrito y su estado vacio
    - Gestionar unidades, colores, tallas y eliminacion de productos
    - Calcular y actualizar el subtotal
    - Gestionar formulario de pago y modal de confirmacion
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
    // Se selecciona el wrapper de los productos y la seccion del estado vacio
    const wrapper = document.querySelector(`.Cart`)
    const empty = document.querySelector(`.Empty`)

    // Variables para el calculo del precio total
    let subtotal = 0
    const subtotalSpan = wrapper.querySelector(`.Quantity-span`)

    // Variables para el formulario de pago
    const form = document.querySelector('.Payment-form')
    const paymentCtas = wrapper.querySelector(`.Payment-ctas`)
    const paymentButton = wrapper.querySelector(`.Payment-button`)

    const formButtons = form.querySelectorAll(`.Form-button`)
    const formContents = form.querySelectorAll(`.Form-content`)
    const formIcons = form.querySelectorAll(`.Icon-dropdown`)

    const formInput = form.querySelectorAll(`.Form-input`)
    const formSubmit = form.querySelector(`.Form-submit`)

    // Variables para el modal
    const modal = document.querySelector(`.Modal`)
    const modalButtonClose = document.querySelector(`.Transaction-button`)

    // Variables para mostrar / ocultar el header
    const header = document.querySelector(`.Header`)
    let scroll = window.scrollY

    // Funciones
    /**
     * Actualiza la pagina segun hay o no elementos en el carrito
     *      - Si hay productos muestra el bloque del carrito
     *      - Si no hay productos muestra el estado vacio
     * 
     * @function    updateEmptyState
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const updateEmptyState = () => {
        const hasCards = wrapper.querySelectorAll(`.Product`).length
        if (hasCards > 0) {
            empty.style.display = `none`
            wrapper.style.display = `grid`
        } else {
            empty.style.display = `flex`
            wrapper.style.display = `none`
        }
    }





    /**
     * Genera la card de un producto del carrito y añade sus interacciones
     *      - Crea el contenido visual de la card
     *      - Añade rebaja, tallas, colores y controles de unidades
     * 
     * @function    createProductCard
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Object}        item            Item guardado en el carrito
     * @return      {void} No devuelve ningun valor
     */
    const createProductCard = (productInfo, item) => {
        const fragment = document.createDocumentFragment()
        const wrapper = document.querySelector(`.Cart-ul`)
        const card = document.createElement(`li`)


        card.classList.add(`Cart-li`, `Product`)
        // El enlace pasa a ser solo la imagen del producto para que el usuario pueda cambiar el color y el tamaño
        card.innerHTML = `
        <div class="Product-wrapper Wrapper Wrapper-outer">
            <div class="Product-wrapper Wrapper Wrapper-inner">
                <div class="Product-content">
                    <a href="./product.html?id=${productInfo.id}" title="${productInfo.name}" class="Product-a">
                        <img loading="lazy" src="${productInfo.colors[0].srcUpscaled}" alt="${productInfo.name}" class="Product-img">
                    </a>
                    <div class="Product-info">
                        <h2 class="Product-name">${productInfo.name}</h2>                
                        <div class="Product-price Price">
                            <span class="Price-original">${productInfo.price}</span>
                            <img loading="lazy" src="assets/iconos/moneda-baya.webp" alt="" class="Price-img">
                        </div>
                    </div>
                </div> 
                <div class="Product-units">
                    <button class="Product-add" title="Añadir una unidad de ${productInfo.name}" aria-label="Añadir una unidad de ${productInfo.name}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Add-icon" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                        </svg>
                    </button>
                    <span class="Product-span Units">${item.units}</span>
                    <button class="Product-remove" title="Quitar una unidad de ${productInfo.name}" aria-label="Quitar una unidad de ${productInfo.name}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Remove-icon" viewBox="0 0 16 16">
                            <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                        </svg>
                    </button>
                </div>
            </div>  
            <div class="Product-buttons">
                <button class="Product-button" title="Eliminar ${productInfo.name}" aria-label="Eliminar ${productInfo.name}">
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

        // Añade las interacciones de los colores, los tamaños y los botones para cambiar las unidades
        addColorsInteraction(productInfo, card, item)
        addSizesInteraction(productInfo, card, item)
        addUnitsInteraction(productInfo, card, item)

        // Añade eventListener al boton de eliminar el producto
        const deleteButton = card.querySelector(`.Product-button`)
        deleteButton.addEventListener(`click`, () => {
            deleteProduct(productInfo, card, item)
        })

        // Actualiza la variable del precio total y la muestra en pantalla
        subtotal = subtotal + (productInfo.price * ((100 - productInfo.sale) / 100) * item.units)
        subtotalSpan.innerHTML = subtotal
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
     * Añade el tamaño o tamaños del producto
     *      - Si hay varias tallas crea botones seleccionables
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
                    productSize.ariaLabel = `Talla ${talla}`
                    productSize.innerHTML = `
                    <button title="Talla ${talla}" aria-label="Talla ${talla}" class="Size-button">${talla}</button>`
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
     * Añade la interaccion a los tamaños
     *      - Marca la talla seleccionada en la card
     *      - Guarda el indice de talla seleccionado en el item del carrito
     * 
     * @function    addSizesInteraction
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @param       {Object}        item            Item guardado en el carrito
     * @return      {void} No devuelve ningun valor
     */
    const addSizesInteraction = (productInfo, productCard, item) => {
        // Se seleccionan los botones de talla de la card actual
        const productSizeButtons = productCard.querySelectorAll(`.Size-button`)

        // Si el producto ya existe en el carrito, recupera la talla guardada para marcarla al cargar
        if (cart.find(product => product.id === productInfo.id)) {
            const index = cart.findIndex(product => product.id === productInfo.id)
            if (cart[index].size !== null) {
                const size = item.size
                productSizeButtons.forEach(() => {
                    productSizeButtons[size].classList.add(`isSelected`)
                })
            }
        }

        // Al hacer click en una talla se desmarca el resto, se marca la seleccionada y se guarda en localStorage
        productSizeButtons.forEach((button, i) => {
            button.addEventListener(`click`, () => {
                productSizeButtons.forEach((_, i) => {
                    productSizeButtons[i].classList.remove(`isSelected`)
                })
                button.classList.add(`isSelected`)
                item.size = i

                localStorage.setItem(`cart`, JSON.stringify(cart))
            })
        })
    }





    /**
     * Añade los colores al producto
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
                productColor.innerHTML = `
                <button title="Color ${color.color}" aria-label="Color ${color.color}" class="Color-button"></button>`
                const productColorBtn = productColor.querySelector(`.Color-button`)
                productColorBtn.style.backgroundColor = color.code
                colorsList.appendChild(productColor)
            }
            location.insertAdjacentElement("beforebegin", productColors)
        }

    }





    /**
     * Añade la interaccion a los colores
     *      - Marca el color seleccionado y desmarca el resto
     *      - Actualiza la imagen y guarda el color en el item del carrito
     * 
     * @function    addColorsInteraction
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @param       {Object}        item            Item guardado en el carrito
     * @return      {void} No devuelve ningun valor
     */
    const addColorsInteraction = (productInfo, productCard, item) => {
        // Selecciona todos los colores y les añade eventListener
        const productColorBtns = productCard.querySelectorAll(`.Color-button`)
        if (productColorBtns.length > 0) {
            // Si el producto ya existe en el carrito, recupera el color guardado y lo marca por defecto
            if (cart.find(product => product.id === productInfo.id)) {
                const color = item.color
                productColorBtns.forEach(() => {
                    productColorBtns[color].classList.add(`isSelected`)
                    updateImage(productInfo, color, productCard)
                })
            }

            // Al hacer click en un color se desmarca el resto, se marca el nuevo y se guarda en localStorage
            productColorBtns.forEach((button, i) => {
                button.addEventListener(`click`, () => {
                    productColorBtns.forEach((_, j) => {
                        productColorBtns[j].classList.remove(`isSelected`)

                    })
                    button.classList.add(`isSelected`)
                    updateImage(productInfo, i, productCard)
                    item.color = i

                    localStorage.setItem(`cart`, JSON.stringify(cart))
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
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const updateImage = (productInfo, index, productCard) => {
        // Se selecciona la imagen principal de la card actual
        const image = productCard.querySelector(`.Product-img`)

        // Por defecto se usa la version normal de la imagen del color seleccionado
        let imageSrc = productInfo.colors[index].src

        // Si existe una version con mayor calidad se prioriza para mostrar mejor definicion
        if (image.classList.contains(`Product-img`)) {
            if (productInfo.colors[index].srcUpscaled) {
                imageSrc = productInfo.colors[index].srcUpscaled
            } else {
                imageSrc = productInfo.colors[index].src
            }
        } else {
            imageSrc = productInfo.colors[index].src
        }

        // Actualiza en el DOM la imagen mostrada con la fuente calculada
        image.src = imageSrc
    }





    /**
     * Añade las interacciones a los botones de añadir o restar unidades
     *      - Actualiza unidades, localStorage, contador y subtotal
     *      - Si las unidades llegan a 0 elimina el producto
     * 
     * @function    addUnitsInteraction
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @param       {Object}        item            Item guardado en el carrito
     * @return      {void} No devuelve ningun valor
     */
    const addUnitsInteraction = (productInfo, productCard, item) => {
        // Se seleccionan los botones y el span donde se indican las unidades
        let units = item.units
        const addButton = productCard.querySelector(`.Product-add`)
        const removeButton = productCard.querySelector(`.Product-remove`)
        const unitsSpan = productCard.querySelector(`.Units`)

        // Se les añaden eventListener a los botones de añadir y quitar unidades
        // Se actualiza el valor de item.units de ese producto segun se añadan o quiten
        // Se muestra el valor en el span
        // Se actualiza el almacenamiento local, el precio total y el contador de header y menu
        // En el caso de eliminar unidades si el contador llega a 0 se elimina el producto

        addButton.addEventListener(`click`, () => {
            // Suma una unidad y sincroniza el item con el nuevo valor
            units++
            item.units = units
            unitsSpan.innerHTML = units

            // Guarda el cambio en localStorage y actualiza el contador del carrito
            localStorage.setItem(`cart`, JSON.stringify(cart))
            updateCartCount()

            // Actualiza la variable del precio total y la muestra en pantalla
            subtotal = subtotal + (productInfo.price * ((100 - productInfo.sale) / 100))
            subtotalSpan.innerHTML = subtotal
        })
        removeButton.addEventListener(`click`, () => {
            // Resta una unidad al producto actual
            units--

            // Si llega a 0 elimina el producto completo del carrito
            if (units == 0) {
                deleteProduct(productInfo, productCard, item)
                return
            }

            // Si aun quedan unidades, actualiza estado, localStorage y contador
            item.units = units
            unitsSpan.innerHTML = units
            localStorage.setItem(`cart`, JSON.stringify(cart))
            updateCartCount()

            // Actualiza la variable del precio total y la muestra en pantalla
            subtotal = subtotal - (productInfo.price * ((100 - productInfo.sale) / 100))
            subtotalSpan.innerHTML = subtotal
        })
    }





    /**
     * Elimina un producto del carrito y actualiza la interfaz
     *      - Quita el item del array y del localStorage
     *      - Elimina la card del DOM y recalcula totales
     * 
     * @function    deleteProduct
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @param       {Object}        item            Item guardado en el carrito
     * @return      {void} No devuelve ningun valor
     */
    const deleteProduct = (productInfo, productCard, item) => {
        // Encuentra la posicion del producto que se quiere eliminar comprobando que todas las caracteristicas coincidan (id, tamaño y color)
        let index = 0
        for (const product of cart) {
            if (product.id === item.id && product.color === item.color && product.size === item.size) {
                break
            }
            index++
        }

        // Actualiza la variable del precio total y la muestra en pantalla
        subtotal = subtotal - (productInfo.price * ((100 - productInfo.sale) / 100) * item.units)
        subtotalSpan.innerHTML = subtotal

        // Quita el producto del array del carrito
        // Actualiza el almacenamiento local segun el nuevo array
        // Le añade a la card la clase isDeleted
        // Elimina la card del DOM
        // Actualiza el contador del carrito
        // Actualiza el calculo del ancho de las cards
        // Actualiza la visualizacion sin productos en carrito por si era el ultimo producto
        cart.splice(index, 1)
        localStorage.setItem(`cart`, JSON.stringify(cart))
        productCard.classList.add(`isDeleted`)
        productCard.remove()
        updateCartCount()
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
    // Ayuda de la IA
    const setCardWidths = () => {
        // Se selecciona el contenedor principal del carrito
        const wrapper = document.querySelector(`.Cart`)

        // Se seleccionan los bloques de contenido que se van a igualar en ancho
        const cards = wrapper.querySelectorAll(`.Product-content`)

        // Si no hay cards, elimina la variable CSS y termina la funcion
        if (cards.length < 1) {
            wrapper.style.removeProperty(`--cart-base-width`)
            return
        }

        // Limpia el valor previo para recalcular desde cero en cada invocacion
        wrapper.style.removeProperty(`--cart-base-width`)

        // Recorre todas las cards para obtener el mayor ancho
        let maxWidth = 0
        cards.forEach(card => {
            const cardWidth = Math.ceil(card.getBoundingClientRect().width)
            if (cardWidth > maxWidth) maxWidth = cardWidth
        })

        // Guarda el ancho maximo en una variable CSS para aplicarlo a todas las cards
        wrapper.style.setProperty(`--cart-base-width`, `${maxWidth}px`)
    }





    /**
     * Vacia el carrito cuando se ha realizado la compra
     *      - Elimina todas las cards del DOM
     *      - Reinicia array, localStorage, subtotal y contadores
     * 
     * @function    emptyCart
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const emptyCart = () => {
        // Se seleccionan todas las cards de producto renderizadas en el carrito
        const productCards = document.querySelectorAll(`.Product`)

        // Se elimina visualmente cada card del DOM
        productCards.forEach((_, i) => {
            productCards[i].classList.add(`isDeleted`)
            productCards[i].remove()
        })

        // Se vacia el array del carrito y se sincroniza localStorage
        cart.length = 0
        localStorage.setItem(`cart`, JSON.stringify(cart))

        // Se reinicia el subtotal mostrado
        subtotal = 0
        subtotalSpan.innerHTML = subtotal

        // Se actualizan contador, anchos y estado vacio de la pagina
        updateCartCount()
        setCardWidths()
        updateEmptyState()
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
     * Obtiene los productos del JSON y genera las cards del carrito
     *      - Recorre los items del carrito para crear sus cards correspondientes
     *      - Actualiza estado vacio, subtotal y ajuste de anchos
     * 
     * @author      DanielNiceto
     * @url         {@link ./productos/productos.json}
     * @return      {void} No devuelve ningun valor
     */
    fetch(`./productos/productos.json`, options)
        .then(response => response.json())
        .then(data => {
            // Se itera el array del carro en vez del array de product.js para tener en cuenta items repetidos
            cart.forEach(item => {
                if (data.find(product => product.id === item.id)) {
                    data.forEach(product => {
                        if (product.id === item.id) {
                            createProductCard(product, item)
                        }
                    })
                }
            })
            updateEmptyState()
            subtotalSpan.innerHTML = subtotal
            // Usar requestAnimationFrame para que el cálculo se haga después de que se pongan las cards
            requestAnimationFrame(() => {
                setCardWidths()
            })
            window.addEventListener(`resize`, () => {
                setCardWidths()
            })
        })
        .catch(error => console.error(`Error:`, error))
        .finally(() => {
            controller.abort()
        })

    // Se invocan las funciones importadas de menu.js y storage.js
    // Y se comprueba si la lista del carrito esta vacia o no
    manageMenu()
    updateFavouriteCount()
    updateCartCount()
    updateEmptyState()




    /**
     * Muestra el formulario de pago al pulsar el boton de continuar
     *      - Oculta los CTAs iniciales
     *      - Muestra el formulario y abre la primera seccion
     * 
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    paymentButton.addEventListener(`click`, () => {
        form.classList.add(`isVisible`)
        formIcons[0].classList.add(`isVisible`)
        paymentCtas.style.display = `none`
    })


    /**
     * Gestiona el acordeon de secciones del formulario de pago
     *      - Si se pulsa una seccion abierta la cierra
     *      - Si se pulsa una seccion cerrada cierra las demas y abre la seleccionada
     * 
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    formButtons.forEach((_, i) => {
        console.log(formButtons)
        console.log(formIcons)
        formButtons[i].addEventListener(`click`, () => {
            if (formContents[i].classList.contains(`isVisible`)) {
                // Si hay una desplegada y se vuelve a hacer clic se oculta
                formContents[i].classList.remove(`isVisible`)
                formIcons[i].classList.remove(`isVisible`)
                return
            }
            formContents.forEach((_, j) => {
                formContents[j].classList.remove(`isVisible`)
                formIcons[j].classList.remove(`isVisible`)
            })
            formContents[i].classList.add(`isVisible`)
            formIcons[i].classList.add(`isVisible`)

            console.log(formButtons[i])
        })
    })


    /**
     * Muestra el modal de confirmacion al enviar el formulario y vacia el carrito
     * 
     * @author      DanielNiceto
     * @param       {Event}         e   Evento submit del formulario
     * @return      {void} No devuelve ningun valor
     */
    form.addEventListener('submit', (e) => {
        // preventDefault evita que se redirija a otra pagina
        e.preventDefault()

        modal.classList.add(`isVisible`)
        emptyCart()
    })


    /**
     * Valida visualmente los campos del formulario
     *      - Si un input tiene valor elimina la clase isEmpty
     *      - Si un input esta vacio añade la clase isEmpty
     * 
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    formSubmit.addEventListener(`click`, () => {
        formInput.forEach((_, i) => {
            if (formInput[i].value) {
                formInput[i].classList.remove(`isEmpty`)
            } else {
                formInput[i].classList.add(`isEmpty`)
            }
        })
    })


    /**
     * Cierra el modal de confirmacion
     * 
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    modalButtonClose.addEventListener(`click`, () => {
        modal.classList.remove(`isVisible`)
    })

})()
