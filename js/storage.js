'use strict'

/*
----------------------------------------
storage.js
Son funciones exportables para importarlas en cada pagina de la web
    Interacciones:
    - Gestiona el almacenamiento de favoritos y el carrito (añade o quita productos)
    - Gestiona la visualizacion del icono de favoritos (lo muestra con el borde o relleno)
    - Gestiona el numero a mostrar en los botones de favoritos y carrito del header / menú
    Estructura:
    - Variables exportables de carrito y favoritos 
    - Constantes
    - Funciones
----------------------------------------
*/

// Variables
// Se inicializan los arrays para cart y favoritos
export let favourites = []
export let cart = []

// Se lee el almacenamiento local del navegador para preparar el estado inicial de favoritos y carrito
// Hecho con ayuda de la IA
const storedFavourites = localStorage.getItem(`favourites`)
const storedCart = localStorage.getItem(`cart`)

// Se seleccionan los elementos de la pagina que van a ser los contadores de favoritos y carrito
// Se usa querySelectorAll porque hay dos botones de cada (el del header y el del menu)
const favouritesCount = document.querySelectorAll(`.Button-span--fav`)
const cartsCount = document.querySelectorAll(`.Button-span--cart`)


// Comprobaciones
// Si existe storedFavourites y storedCart, se convierten a JSON
if (storedFavourites) {
    favourites = JSON.parse(storedFavourites)
}
if (storedCart) {
    cart = JSON.parse(storedCart)
}


// Funciones a exportar

/**
 * Administra el array y localStorage de favoritos
 * 
 * - Si el id del producto ya existe en el array de favoritos se elimina
 * - Si el id del producto no existe en el array de favoritos se añade
 * - Actualiza el almacenamiento local con el nuevo array
 * 
 * @function    manageFavourites
 * @author      DanielNiceto
 * @param       {Object}  porductInfo   Informacion del producto
 * @return      {void} No devuelve ningun valor
 */
export const manageFavourites = (productInfo) => {
    if (favourites.find(favourite => favourite.id === productInfo.id)) {
        const index = favourites.findIndex(fav => fav.id === productInfo.id)
        favourites.splice(index, 1)
    } else {
        let favourite = {
            id: productInfo.id
        }
        favourites = [...favourites, favourite]
    }
    localStorage.setItem(`favourites`, JSON.stringify(favourites))
}

/**
 * Administra el array y localStorage del carrito
 * 
 * - Si el id, color y talla del producto ya existe en el array del carrito se añade una unidad
 * - Si el id, color y talla del producto no existe en el array del carrito se añade
 * - Actualiza el almacenamiento local con el nuevo array
 * 
 * @function  manageCart
 * @return    {void} No devuelve ningun valor
 * @author    DanielNiceto
 * @param     {Object}  porductInfo     Informacion del producto
 * @param     {Number}  selectedColor   Indice del color seleccionado
 * @param     {Number | null}  selectedSize    Indice de la talla seleccionada
 */
export const manageCart = (productInfo, selectedColor, selectedSize) => {
    for (const product of cart) {
        if (product.id === productInfo.id && product.color === selectedColor && product.size === selectedSize) {
            product.units++
            localStorage.setItem(`cart`, JSON.stringify(cart))
            return
        }
    }
    let cartProduct = {
        id: productInfo.id,
        color: selectedColor,
        size: selectedSize,
        units: 1
    }
    cart = [...cart, cartProduct]
    localStorage.setItem(`cart`, JSON.stringify(cart))
}

/**
 * Administra la visualizacion del icono de favoritos
 * 
 * - Si el id del producto ya existe en el array de favoritos se quita del icono de favoritos la clase isFavourite
 *      - El icono pasa de verse rellenado de color rojo a verse el contorno de color negro
 * - Si el id del producto no existe en el array de favoritos se añade
 * - Actualiza el almacenamiento local con el nuevo array al icono de favoritos la clase isFavourite
 *      - El icono pasa de verse el contorno de color negro a verse rellenado de color rojo
 * 
 * @function    manageFavIcon
 * @author      DanielNiceto
 * @param       {Object}  porductInfo     Informacion del producto
 * @param       {Number}  favouriteIcon   Elemento del DOM que representa el icono de favoritos del producto
 * @return      {void} No devuelve ningun valor
 */
export const manageFavIcon = (productInfo, favouriteIcon) => {
    if (favourites.find(favourite => favourite.id === productInfo.id)) {
        favouriteIcon.classList.add(`isFavourite`)
    } else {
        favouriteIcon.classList.remove(`isFavourite`)
    }
}

/**
 * Actualiza el contador del boton de favoritos del header y menú
 * 
 * - Se iteran los botones seleccionados en Variables
 * - Comprueba el numero de items del array de favoritos
 *      - Si no hay items (favourites.length < 1), el contador esta vacío y se le quita la calse hasItems
 *      - Si hay items, el contenido del contador es el tamaño del array y se le añade la calse hasItems
 * 
 * @function    updateFavouriteCount
 * @author      DanielNiceto
 * @return      {void} No devuelve ningun valor
 */
export const updateFavouriteCount = () => {
    favouritesCount.forEach((_, i) => {
        if (favourites.length < 1) {
            favouritesCount[i].innerHTML = ""
            favouritesCount[i].classList.remove(`hasItems`)
        } else {
            favouritesCount[i].innerHTML = favourites.length
            favouritesCount[i].classList.add(`hasItems`)
        }
    })
}

/**
 * Actualiza el contador del boton del carrito del header y menú
 * 
 * - Se inicializa la variable cartUnits que sumara los items del array y se le da un valor inicial de 0
 * - Se itera el array del carrito, por cada producto se obtienen sus unidades y se suman a cartUnits
 * - Se iteran los botones seleccionados en Variables
 * - Comprueba el numero de items del array del carrito
 *      - Si no hay items (cart.length < 1), el contador esta vacío y se le quita la calse hasItems
 *      - Si hay items, el contenido del contador es cartUnits y se le añade la calse hasItems
 * 
 * @function    updateCartCount
 * @author      DanielNiceto
 * @return      {void} No devuelve ningun valor
 */
export const updateCartCount = () => {
    let cartUnits = 0
    for (const product of cart) {
        cartUnits = cartUnits + product.units
    }
    cartsCount.forEach((_, i) => {
        if (cart.length < 1) {
            cartsCount[i].innerHTML = ""
            cartsCount[i].classList.remove(`hasItems`)
        } else {
            cartsCount[i].innerHTML = cartUnits
            cartsCount[i].classList.add(`hasItems`)
        }
    })
}