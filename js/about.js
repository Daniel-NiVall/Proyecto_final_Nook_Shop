'use strict'

import { manageMenu } from "./menu.js";
import { updateFavouriteCount, updateCartCount } from "./storage.js";

/*
----------------------------------------
about.js
    Interacciones (solo para pagina about.html):
    - Cuando un título entra en la ventana se añade animación y se quita intersectionObserver para que solo ocurra la primera vez
    - Cuando se hace scroll hacia abajo se oculta el header y cuando se hace scroll hacia arriba se visualiza
    Estructura:
    - Variables
    - Constantes
    - Funciones
    - Invocacion de las funciones
----------------------------------------
*/


(() => {

    // Variables
    // Se selecciona el elemento a mostrar / ocultar (header)
    const header = document.querySelector(`.Header`)
    // Se selecciona el scroll inicial de la ventana
    let scroll = window.scrollY

    // Se seleccionan los encabezados de cada seccion
    const headers = document.querySelectorAll(`.Section-header`)


    // Funciones

    /**
     * Funcion que hace aparecer las letras de los titulos con una animacion vertical con rebote
     * Las letras aparecen con delay una despues de otra
     * 
     * @function    setIntersectionObserverLetters
     * @author      DanielNiceto
     * @return      {void} No devuelve ningun valor
     */
    const setIntersectionObserverLetters = () => {
        // se crean las opciones del observador. Las letras aparecen cuando la etiqueta header es completamente visible
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 1
        }

        // Se guarda en una constante el tiempo que se quiere que dure la animacion
        // El delay se calculara en base al número de letras del header para que todas las animaciones duren lo mismo
        const animationTime = 800

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Se establece un indice que servira para aplicar el delay a las letras, aplicando un efecto cascada a la animacion
                let index = 0

                if (entry.isIntersecting) {
                    // Se guardan en un array cada caracter del encabezado
                    const letters = entry.target.childNodes

                    // Por cada caracter, si no esta vacio, se añade la clase isVisible y se establece un tiempo de espera
                    letters.forEach(letter => {
                        if (letter.childNodes.length > 0) {   /* Esto ignora el contenido vacio (espacios) */

                            // setTiemout aplica un retraso a la adicion de la clase isVisible de cada letra
                            setTimeout(() => {
                                letter.classList.add(`isVisible`)
                            }, (animationTime / letters.length) * index)

                            // Se aumenta index para que no aparezcan todas las letras a la vez
                            index++
                        }
                    })
                }
            })
        }, observerOptions)

        // Se aplica el intersectionObserver a cada header
        headers.forEach(header => {
            observer.observe(header)
        })
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


    // Se invoca el intersectionObserver de los headers
    setIntersectionObserverLetters()

    // Se invocan las funciones importadas de menu.js y storage.js
    manageMenu()
    updateFavouriteCount()
    updateCartCount()

})()
