import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

// 'persist' guardará el carrito en localStorage
// así no se borra cuando el usuario refresca la página.

export const useCartStore = create(
    persist(
        (set, get) => ({
            // --- ESTADO ---
            cartItems: [], // Array de productos en el carrito

            // --- ACCIONES (Mutaciones) ---

            /**
             * Añade un producto al carrito o incrementa su cantidad.
             * ¡YA NO REVISA EL STOCK!
             */
            addProduct: (product) => {
                const { cartItems } = get();
                const productInCart = cartItems.find(item => item.id === product.id);

                if (productInCart) {
                    // 1. Si el producto ya está en el carrito, incrementa cantidad
                    const updatedCartItems = cartItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                    set({ cartItems: updatedCartItems });

                } else {
                    // 2. Si es un producto nuevo, lo añade con cantidad 1
                    set({ cartItems: [...cartItems, { ...product, quantity: 1 }] });
                }
            },

            /**
             * Reduce la cantidad de un producto o lo elimina si llega a 0.
             */
            decrementProduct: (productId) => {
                const { cartItems } = get();
                const productInCart = cartItems.find(item => item.id === productId);

                if (productInCart && productInCart.quantity > 1) {
                    // 1. Si hay más de 1, solo reducimos la cantidad
                    const updatedCartItems = cartItems.map(item =>
                        item.id === productId
                            ? { ...item, quantity: item.quantity - 1 }
                            : item
                    );
                    set({ cartItems: updatedCartItems });
                } else {
                    // 2. Si solo queda 1, eliminamos el producto del carrito
                    set({ 
                        cartItems: cartItems.filter(item => item.id !== productId) 
                    });
                }
            },

            /**
             * Elimina un producto del carrito, sin importar la cantidad.
             */
            removeProduct: (productId) => {
                set(state => ({
                    cartItems: state.cartItems.filter(item => item.id !== productId)
                }));
            },

            /**
             * Vacía completamente el carrito.
             */
            clearCart: () => {
                set({ cartItems: [] });
            },


            // --- SELECTORES (Cálculos) ---
            
            /**
             * Calcula el número total de ítems (no productos únicos).
             */
            getTotalItems: () => {
                const { cartItems } = get();
                return cartItems.reduce((total, item) => total + item.quantity, 0);
            },

            /**
             * Calcula el monto total a pagar.
             */
            getTotalPrice: () => {
                const { cartItems } = get();
                return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'cart-storage', // Nombre para el localStorage
        }
    )
);