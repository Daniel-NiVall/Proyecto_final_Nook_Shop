'use strict'

// Se importan funciones y arrays de otros archivos
import { manageFavourites, manageFavIcon, updateFavouriteCount, updateCartCount } from './storage.js';
import { manageMenu } from './menu.js';

/*
----------------------------------------
index.js
    Interacciones (solo para pagina index.html):
    - Añadir las cards de productos a los carruseles correspondientes
    - Añadir a las cards el precio rebajado
    - Añadir a las cards los colores disponibles
    - Añadir el movimiento de los carruseles
    - Añadir animaciones de los parrafos de la intro
    - Añadir animaciones de los bloques de texto de la intro
    - Añadir visualizacion mobile de las cards
    - Añadir movimiento del ehader
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
    // Selecciones de contenedores de los carruseles
    const sectionPopular = document.querySelector(`.Popular`)
    const sectionNew = document.querySelector(`.New`)

    const wrapperInnerPopular = sectionPopular.querySelector(`.Section-inner--popular`)
    const wrapperInnerNew = sectionNew.querySelector(`.Section-inner--new`)

    const outerWrapper = sectionPopular.querySelector(`.Section-outer`) // Ambas tienen el mismo tamaño en el Section-outer por lo que solo hace falta seleccionar una instancia

    // Seleccion de botones para el movimiento de los carruseles
    const popularButtonNext = sectionPopular.querySelector(`.Popular-next`)
    const popularButtonPrev = sectionPopular.querySelector(`.Popular-prev`)
    const newButtonNext = sectionNew.querySelector(`.New-next`)
    const newButtonPrev = sectionNew.querySelector(`.New-prev`)
    // Inicializacion de las posiciones de los carruseles
    let positionPopular = 0
    let positionNew = 0

    // Variables para el responsive de los carruseles
    // Con ayuda de la IA
    const mobileQuery = window.matchMedia(`(max-width: 850px)`)
    let wasMobile = mobileQuery.matches

    // Variables para visualizar / ocultar el header
    const header = document.querySelector(`.Header`)
    let scroll = window.scrollY

    // Variables para la animacion de la introduccion
    const gallery = document.querySelectorAll(`.Gallery`)
    const galleryBackground = document.querySelectorAll(`.Gallery-bg`)


    // Funciones
    /**
     * Crea la card del producto, añade el contenido (imagenes, nombre, precio y boton de favoritos)
     * Añade eventListeners al pulsar el boton de favoritos y al dejar de hacer hover a la card
     * 
     * @function    createCarrousel
     * @author      DanielNiceto
     * @param       {Object}        porductInfo     Informacion del producto
     * @param       {Element}       location        Ubicacion donde se añade la card
     * @return      {void} No devuelve ningun valor
     */
    const createCarrousel = (productInfo, location) => {
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
                <h3 class="Info-h3 Name">${productInfo.name}</h3>
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

        // Invoca las funcion para añadir la rebaja
        addSale(productInfo, productCard)
        // Invoca las funcion para añadir los colores
        addColors(productInfo, productCard)

        // Se selecciona el boton de favorito y el icono de favorito relleno
        const favouriteBtn = productCard.querySelector(`.Favourite`)
        const favouriteSvg = productCard.querySelector(`.Favourite-svg--fill`)

        // Al crear la card invoca la funcion para administrar la visualizacion del icono de favorito
        manageFavIcon(productInfo, favouriteSvg)


        // Añade eventListeners para cuando se clica el boton de favorito
        // Invoca las funciones para administrar:
        //      - el almacenamiento local de la lista de favoritos
        //      - la visualizacion del icono de favoritos de la card
        //      - el contador de favoritos del header
        favouriteBtn.addEventListener(`click`, () => {
            manageFavourites(productInfo, favouriteSvg)
            manageFavIcon(productInfo, favouriteSvg)
            updateFavouriteCount()
        })

        // Elimina focus de los botones al salir del hover para que los elementos vuelvan a su posición inicial
        // Con ayuda de la IA
        productCard.addEventListener(`mouseleave`, () => {
            if (document.activeElement === favouriteBtn) {
                // .blur() fuerza que el elemento deje de estar activo
                document.activeElement.blur()
            }
        })
    }





    /**
     * Comprueba que el producto esté rebajado
     *      - Si no esta rebajado no hace nada
     *      - Si esta rebajado añade el precio rebajado y modifica la visualizacion del original
     * 
     * @function    addSale
     * @author      DanielNiceto
     * @param       {Object}        porductInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addSale = (productInfo, productCard) => {
        // Si está rebajado crea un span que contendrá el texto de la rebaja, lo situa antes del precio original, añade el precio rebajado y tacha el original
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
     *      - Si tiene colores crea una lista para mostrar los diferentes colores y les añade eventListeners para cambiar la imagen del producto
     * 
     * @function    addColors
     * @author      DanielNiceto
     * @param       {Object}        porductInfo     Informacion del producto
     * @param       {Element}       productCard     Card del producto
     * @return      {void} No devuelve ningun valor
     */
    const addColors = (productInfo, productCard) => {
        // Variables
        // Se selecciona el numero de colores que tiene el producto
        const productColorSum = productInfo.colors.length
        // Se selecciona la ubicacion donde iran los colores
        const prodcutWrapper = productCard.querySelector(`.Card-article`)
        // Selecciona la imagen y el elemento picture del producto
        const image = productCard.querySelector(`.Card-img`)
        const picture = productCard.querySelector(`.Card-source`)
        // Se selecciona el enlace del producto
        const cardLink = productCard.querySelector(`.Card-a`)

        // Actualiza la imagen visualizada segun el indice del color
        // Diferencia entre picture y img segun el tamaño de la ventana
        const updateImage = (index) => {
            // Se selecciona el ancho de la ventana
            const windowWidth = window.innerWidth
            // Se obtiene el valor del atributo media que tiene picture (media="max-width: 700px") y se aisla el 700 del resto del texto
            const pictureMedia = Number(picture.media.substring("12", "15"))

            // Si el ancho de la pantalla es mayor al media de picture, se usa la imagen con mayor calidad
            // Si el ancho de la pantalla es menor al media de picture, se usa la imagen con menor calidad
            if (windowWidth > pictureMedia) {
                image.src = productInfo.colors[index].srcUpscaled
            } else {
                picture.srcset = productInfo.colors[index].src
            }

            // Si hay mas de un color modifica el titulo para que coincida con el color seleccionado
            if (productInfo.colors.length > 1) {
                cardLink.title = `${productInfo.name} - ${productInfo.colors[index].color}`
            } else {
                cardLink.title = `${productInfo.name}`
            }
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
     * Calcula el gap entre cards y configura el movimiento de ambos carruseles
     *      - Ajusta la separación de las cards segun el tamaño de la pantalla
     *      - Añade los eventListeners de resize, cambio de breakpoint y botones next/prev
     * 
     * @function    carrouselMovement
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const carrouselMovement = () => {
        // Se inicializan las variables principales
        // Espacio entre cards
        let gap
        // Numero entero de cards que se pueden ver dentro del carrusel
        let visibleCards
        // Ancho de la card
        let cardWidth

        // Se obtiene el numero de cards totales en cada carrusel
        let popularCardsCount = wrapperInnerPopular.childElementCount
        let newCardsCount = wrapperInnerNew.childElementCount

        // Funciones
        // Obtiene el espacio entre cards del carrusel
        const getCarrouselGap = () => {

            const card = document.querySelector(`.Card`)
            cardWidth = Number(window.getComputedStyle(card).width.replace(`px`, ``))                           // Se obtiene el ancho de la card
            const outerWrapperWidth = Number(window.getComputedStyle(outerWrapper).width.replace(`px`, ``))     // Se obtiene el ancho del wrapper

            visibleCards = Math.floor(outerWrapperWidth / cardWidth)        // Calcula el numero de cards (redondeado hacia abajo) que se pueden mostrar

            // Para tamaños mayores de 850px (desktop)
            // Si hay mas de una carta visible
            // El gap es el ancho del contenedor - (el numero de cards visibles por el ancho de la card) todo dividido entre las cards visibles - 1
            // Se resta 1 a visible cards porque siempre hay un espacio menos que cards visibles
            // En un ancho de pantalla en el que quepan 5 cards habran 4 espacios separandolas
            // Si no hay mas de una carta el gap es 0
            // Para tamaños menores de 850px el gap es 16px fijo
            if (window.innerWidth > 850) {
                if (visibleCards > 1) {
                    gap = ((outerWrapperWidth - (visibleCards * cardWidth)) / (visibleCards - 1))
                } else {
                    gap = 0
                }
            } else {
                gap = 16
            }
        }

        // Reset del carrusel
        // Se usa cuando hay un cambio de pantalla de desktop a mobile (850px)
        // Posiciona los carruseles en su posicion inicial (0)
        const resetCarrousel = () => {
            positionNew = 0
            positionPopular = 0

            wrapperInnerPopular.style.transform = `translateX(0px)`
            wrapperInnerNew.style.transform = `translateX(0px)`

            const wrapperOuter = document.querySelectorAll(`.Section-outer`)
            wrapperOuter.forEach((wrapper) => {
                wrapper.scrollLeft = 0
            })
        }
        // Detecta si ha habido un cambio de pantalla de desktop a mobile o viceversa. Si ha cambiado resetea el carrusel
        // Con ayuda de la IA
        const onBreakpointChange = (isMobile) => {
            if (isMobile !== wasMobile) {
                resetCarrousel()
                wasMobile = isMobile
            }
        }

        // Aplica a los crruseles el espacio que se ha calculado
        const applyGap = () => {
            wrapperInnerPopular.style.columnGap = `${gap}px`
            wrapperInnerNew.style.columnGap = `${gap}px`
        }

        // Handlers para los eventos de los botones de siguiente y anterior del carrusel
        // Si la suma de la posicion y las cards visibles es menor que el numero de cards totales
        // Añade uno a la posicion
        // Si es mayor vuelve a la primera posicion
        const calculatePositionNext = (position, totalCards, wrapper) => {
            if (position + visibleCards < totalCards) {
                position++
            } else {
                position = 0
            }
            wrapper.style.transform = `translateX(-${(cardWidth + gap) * position}px)`
            return position
        }

        // Si la posicion es menor o igual que cero
        // La posicion se actualiza para ser igual al numero de cards totales menos las visibles (esto hace que si esta en la primera posicion y se clica el boton vaya a la ultima posicion)
        // Si no resta una posicion
        const calculatePositionPrev = (position, totalCards, wrapper) => {
            if (position <= 0) {
                position = totalCards - visibleCards
            } else {
                position--
            }
            wrapper.style.transform = `translateX(-${(cardWidth + gap) * position}px)`
            return position
        }


        // Se invocan las funciones
        // Invoca las funciones para calcular el gap y aplicarlo al cargar la pagina
        getCarrouselGap()
        applyGap()

        // Se añaden eventListeners
        // Al redimensionar recalcula el espacio y sincroniza el estado con el breakpoint actual
        window.addEventListener(`resize`, () => {
            onBreakpointChange(mobileQuery.matches);
            getCarrouselGap()
            applyGap()
        })
        // Al pasar de desktop a mobile o viceversa resetea el translate del carrusel y recalcular el espacio
        // Con ayuda de la IA
        mobileQuery.addEventListener(`change`, (e) => {
            onBreakpointChange(e.matches);
            getCarrouselGap()
            applyGap()
        })
        // Se añaden eventListeners a los botones de siguiente y anterior y se crea el movimiento de los carruseles
        popularButtonNext.addEventListener(`click`, () => {
            positionPopular = calculatePositionNext(positionPopular, popularCardsCount, wrapperInnerPopular)
        })
        popularButtonPrev.addEventListener(`click`, () => {
            positionPopular = calculatePositionPrev(positionPopular, popularCardsCount, wrapperInnerPopular)
        })
        newButtonNext.addEventListener(`click`, () => {
            positionNew = calculatePositionNext(positionNew, newCardsCount, wrapperInnerNew)
        })
        newButtonPrev.addEventListener(`click`, () => {
            positionNew = calculatePositionPrev(positionNew, newCardsCount, wrapperInnerNew)
        })
    }





    /**
     * IntersectionObserver para mostrar u ocultar el parrafo de cada galeria al cambiar entre la de mobiliario y la de ropa
     *      - Si la galeria entra en pantalla añade la clase isVisible al parrafo
     *      - Si la galeria sale de pantalla elimina la clase isVisible del parrafo
     * 
     * @function    setIntersectionObserverParagraphs
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const setIntersectionObserverParagraphs = () => {
        // Opciones del observador
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        // Se define el observador
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Se selecciona el parrafo de cada bloque de galeria
                const paragraph = entry.target.querySelector(`.Gallery-p`)

                // Si entra en pantalla se muestra el parrafo, si sale se oculta
                if (entry.isIntersecting) {
                    paragraph.classList.add('isVisible');
                } else {
                    paragraph.classList.remove('isVisible');
                }
            });
        }, observerOptions);

        // Se aplica el observador a cada galeria
        gallery.forEach(tag => {
            observer.observe(tag);
        });
    }





    /**
     * IntersectionObserver para cambiar la frase correspondiente al bloque visible de cada galeria
     *      - Si el bloque de fondo entra en pantalla añade la clase isMarked a su frase
     *      - Si el bloque de fondo sale de pantalla elimina la clase isMarked de su frase
     * 
     * @function    setIntersectionObserverSentences
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const setIntersectionObserverSentences = () => {
        // Opciones del observador
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        // Se define el observador
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Se selecciona la galeria a la que pertenece el bloque observado
                const gallery = entry.target.closest(`.Gallery`)

                // Se seleccionan los fondos y las frases de esa galeria
                const backgrounds = gallery.querySelectorAll(`.Gallery-bg`)
                const sentences = gallery.querySelectorAll(`.Gallery-span`)

                // Se obtiene el indice del fondo visible para usar la frase correspondiente
                const backgroundList = Array.from(backgrounds)
                const backgroundIndex = backgroundList.indexOf(entry.target)
                const sentence = sentences[backgroundIndex]

                // Si entra en pantalla se marca la frase, si sale se desmarca
                if (entry.isIntersecting) {
                    sentence.classList.add('isMarked');
                } else {
                    sentence.classList.remove('isMarked');
                }
            });
        }, observerOptions);

        // Se aplica el observador a cada bloque de fondo de la galeria
        galleryBackground.forEach(tag => {
            observer.observe(tag);
        });
    }





    /**
     * Configura un IntersectionObserver para mostrar u ocultar los botones y colores de las cards en mobile
     *      - En mobile observa cada card y aplica la clase isVisible cuando entra en pantalla
     *      - En desktop desconecta el observador y restaura el estado predeterminado
     * 
     * @function    setIntersectionObserverCards
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const setIntersectionObserverCards = () => {
        // Opciones del observador
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        // Se inicializa el observador
        let observer = null;

        // Configura o reinicia el observer segun el tamaño de pantalla actual
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

                // Se aplica el observador a cada card
                card.forEach(card => {
                    observer.observe(card);
                });
            } else {
                // Con ayuda de la IA
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
     * Obtiene los productos del JSON y crea las cards en los carruseles de populares y novedades
     *      - Recorre cada producto para añadirlo al carrusel correspondiente
     *      - Al finalizar invoca las funciones de movimiento y animaciones
     * 
     * @author      DanielNiceto
     * @url         {@link ./productos/productos.json}
     * @return      {void} No devuelve ningun valor
     */
    fetch(`./productos/productos.json`, options)
        .then(response => response.json())
        .then(data => {
            // Por cada objeto del JSON
            // Lee si son populares o novedades
            // Diseña la card y la añade al carrusel correspondiente
            data.forEach((product, i) => {
                if (product.popular === true) {
                    createCarrousel(product, wrapperInnerPopular)
                }
                if (product.new === true) {
                    createCarrousel(product, wrapperInnerNew)
                }
            })
            // Una vez terminados los carruseles se invoca:
            //      - La funcion para establecer el espacio y el movimiento de los carruseles
            //      - La funcion para establecer el intersectionObserver de las cards
            //      - La funcion para establecer el intersectionObserver de los textos del intro
            //      - La funcion para establecer el intersectionObserver de los bloques de los textos del intro
            carrouselMovement()
            setIntersectionObserverCards()
            setIntersectionObserverParagraphs()
            setIntersectionObserverSentences()
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
