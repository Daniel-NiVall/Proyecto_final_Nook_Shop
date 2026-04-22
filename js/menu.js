'use strict'

/*
----------------------------------------
cart.js
Es una funcion exportable para importarlo en cada pagina de la web
    Interacciones:
    - Maneja la visualizacion del menu (apertura y cierre de menu) al pulsar los botones
    - Si esta abierta y se agranda la ventana se cierra automaticamente
    Estructura:
    - Constantes
    - Funciones
----------------------------------------
*/

// Constantes
// Se selecciona el menu y los botones para abrir y cerrar el menu
const menu = document.querySelector(`.Menu`)
const menuOpen = document.querySelector(`.Button-menu`)
const menuClose = menu.querySelector(`.Button-close`)

// Funcion a exportar
/**
 * Gestiona la apertura/cierre de un menú responsive añadiendo y quitando
 * la clase `isVisible` al elemento del menú.
 *
 * - Al hacer click en `menuOpen` muestra el menú.
 * - Al hacer click en `menuClose` oculta el menú.
 * - Al redimensionar la ventana, si el ancho es mayor que 850px, oculta el menú.
 *
 * @function manageMenu
 * @author  DanielNiceto
 * @return {void} No devuelve ningún valor.
 */

export const manageMenu = () => {
    // Click: abrir el menú
    menuOpen.addEventListener(`click`, () => {
        menu.classList.add(`isVisible`)
    })
    // Click: cerrar el menú
    menuClose.addEventListener(`click`, () => {
        menu.classList.remove(`isVisible`)
    })
    // Resize: al pasar a desktop se cierra
    window.addEventListener(`resize`, (e) => {
        if (window.innerWidth > 850) {
            menu.classList.remove(`isVisible`)
        }
    })
}