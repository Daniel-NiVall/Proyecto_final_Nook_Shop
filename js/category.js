'use strict'

// Se importan funciones y arrays de otros archivos
import { manageFavourites, manageFavIcon, updateFavouriteCount, updateCartCount } from './storage.js';
import { manageMenu } from './menu.js';

/*
----------------------------------------
category.js
    Interacciones (solo para pagina index.html):
    - Añadir las cards de productos a la pagina de la categoria
    - Añadir a las cards el precio rebajado
    - Añadir a las cards los colores disponibles
    - Añadir visualizacion mobile de las cards
    - Crear la introduccion
    - Crear el breadcrumb
    - Añadir movimiento del header
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
    // Variables para la obtencion de la categoria seleccionada
    // Con ayuda de la IA
    const params = new URLSearchParams(location.search)
    const id = params.get(`id`)

    // Variables para la modificacion del head del DOM
    const meta = document.querySelector(`meta[name=title]`)

    // Se seleccionan las breadcrumbs y el espacio donde iran los productos
    const initialBreadcrumb = document.querySelector(`.Breadcrumb-h1`)
    const intro = document.querySelector(`.Intro`)
    const grid = document.querySelector(`.Grid-ul`)

    // Variables para mostrar / ocultar el header
    const header = document.querySelector(`.Header`)
    let scroll = window.scrollY



    // Funciones
    /**
     * Crea la card del producto, añade el contenido (imagenes, nombre, precio y boton de favoritos)
     * Añade eventListeners al pulsar el boton de favoritos y al dejar de hacer hover a la card
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
                <h2 class="Info-h2 Name">${productInfo.name}</h2>
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
        addSale(productInfo, productCard)
        addColors(productInfo, productCard)

        // Funciones para el boton de favorito
        const favouriteBtn = productCard.querySelector(`.Favourite`)
        const favouriteSvg = productCard.querySelector(`.Favourite-svg--fill`)

        // Primero al cargar la pagina lee el localStorage para actualizar la visualizacion del icono
        manageFavIcon(productInfo, favouriteSvg)



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
     * Comprueba que el producto esté rebajado y ajusta el precio mostrado en la card
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
     * Comprueba que el producto tenga colores
     *      - Si no tiene colores no hace nada
     *      - Si tiene colores crea los elementos y actualiza la imagen segun el color seleccionado
     * 
     * @function    addColors
     * @author      DanielNiceto
     * @param       {Object}        productInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addColors = (productInfo, productCard) => {
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
            // productCard.addEventListener('mouseleave', (e) => {
            //     if (!productCard.contains(e.relatedTarget)) {
            //         updateImage(0)
            //     }
            // })
        }
    }





    /**
     * IntersectionObserver para mostrar u ocultar los iconos y colores de las cards en mobile
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
     * Genera la introduccion segun la categoria seleccionada
     *      - Cambia el contenido del bloque Intro segun el valor del id
     *      - Si no coincide con ninguna categoria muestra un aviso por defecto
     * 
     * @function    createIntro
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const createIntro = () => {
        switch (id) {
            case "mobiliario":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/120px-Timmy_&_Tommy_NH.webp" alt="" class="Intro-img">
            <p class="Intro-p">Tu hogar merece piezas únicas: descubre muebles para cada rincón de la isla.</p>`
                break;
            case "ropa":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/150px-Mabel_NH.webp" alt="" class="Intro-img">
            <p class="Intro-p">Viste a tu personaje con estilo y combina prendas para cualquier temporada.</p>
            <img loading="lazy" src="assets/images/Sable_NH.webp" alt="" class="Intro-img">`
                break;
            case "fosiles":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/150px-Blathers_NH_2.webp" alt="" class="Intro-img">
            <p class="Intro-p">Añade historia a tu museo con fósiles que harán brillar tu colección.</p>`
                break;
            case "cuadros":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/120px-Blathers_NH.webp" alt="" class="Intro-img">
            <p class="Intro-p">Encuentra obras que llenen de color y personalidad las paredes de tu hogar.</p>`
                break;
            case "esculturas":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/150px-Blathers_NH_2.webp" alt="" class="Intro-img">
            <p class="Intro-p">Descubre esculturas con presencia propia para dar carácter a tu espacio.</p>`
                break;
            case "musica":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/70px-K.K._Slider_NH.webp" alt="" class="Intro-img">
            <p class="Intro-p">Pon ritmo a tu isla con melodías y discos para acompañar cada momento.</p>`
                break;
            case "museo":
                intro.innerHTML = `
            <img loading="lazy" src="assets/images/120px-Blathers_NH.webp" alt="" class="Intro-img">
            <p class="Intro-p">Descubre los fósiles y las obras de arte más bonitas.</p>
            <img loading="lazy" src="assets/images/150px-Blathers_NH_2.webp" alt="" class="Intro-img">`
                break;
            default:
                intro.innerHTML = `
            <div class="Intro-alert">
                <img loading="lazy" src="assets/images/Rese_T_NH.webp" alt="" class="Intro-img">
                <p class="Intro-p">¡Ups! Parece que ha habido un problema, pero no te preocupes, no es culpa tuya. Estamos trabajando en arreglarlo.</p>
            </div>
            <a class="Intro-a" title="Volver a la tienda" href="./index.html#Collabs">
                Volver a la tienda
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="Icon-arrow" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                </svg>
            </a>`
                intro.classList.add(`Default`)
                break;

        }
    }





    /**
     * Actualiza el breadcrumb y el titulo de la pagina segun la categoria seleccionada
     * 
     * @function    createBreadcrumbs
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const createBreadcrumbs = () => {
        // Cambia el titulo del documento según el producto seleccionado
        const upperId = id.charAt(0).toUpperCase() + id.slice(1)
        document.title = `${upperId} | Nook Shop`

        meta.setAttribute(`content`, `${upperId} | Nook SHop`)

        initialBreadcrumb.innerHTML = `${upperId}`
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
     * Obtiene los productos del JSON y crea el grid de la categoria seleccionada
     *      - Recorre cada producto para comprobar si coincide con la categoria o subcategoria elegida
     *      - Crea las cards y termina configurando el IntersectionObserver de las cards
     * 
     * @author      DanielNiceto
     * @url         {@link ./productos/productos.json}
     * @return      {void} No devuelve ningun valor
     */
    fetch(`./productos/productos.json`, options)
        .then(response => response.json())
        .then(data => {
            createBreadcrumbs()
            // Por cada objeto del JSON
            // Lee si su categoria o subcategoria coincide con la seleccionada por el usuario
            // Diseña la card y la añade al grid
            data.forEach((product, i) => {
                if (product.category === `${id}` || product.subcategory === `${id}`) {
                    createCard(product, grid)
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
    // Se invoca la funcion que crea la introduccion
    createIntro()



})()
