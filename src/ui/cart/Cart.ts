import NotFoundError from 'errors/not-found';
import { ClearEvent } from 'types/events';
import { SeatIndex } from 'types/map-options';
import { Options } from 'types/options';
import { SeatInfo } from 'types/seat-info';
import utils from 'utils/misc';
import Map from 'ui/map/Map';
import ContainerUI from 'ui/common/Container';
import CartFooterUI from 'ui/cart/Footer';
import CartHeaderUI from 'ui/cart/Header';
import CartTableUI from 'ui/cart/Table';
import CartItemUI from 'ui/cart/Item';
import SeatUI from 'ui/map/Seat';

/**
 * @internal
 */
class CartUI {
    /**
     * A dictionary containing all seats added to the shopping cart, mapped by seat type.
     * Each string is composed by row (r) and column (c) indexed in the following format: "r_c",
     * which is the id of the seat in the document.
     */
    public dict: { [key: string]: string[] } = {};

    /**
     * The main div container containing all the shopping cart elements.
     */
    private cartTable: CartTableUI | undefined;

    /**
     * Text that show total number of items in the shopping cart.
     */
    private cartHeader: CartHeaderUI | undefined;

    /**
     * The text that shows the total cost of the items in the shopping cart.
     */
    private cartFooter: CartFooterUI | undefined;

    /**
     * An object containing all seats added to the shopping cart, mapped by seat type.
     */
    private cart: { [key: string]: SeatIndex[] } = {};

    /**
     * An array of strings containing all the pickable seat types, "available" included.
     */
    private types: string[] = [];

    private options: Options;
    private map: Map;

    public constructor(map: Map) {
        this.map = map;
        this.options = map.options;

        this.deleteClick = this.deleteClick.bind(this);
        this.deleteAllClick = this.deleteAllClick.bind(this);

        this.loadCart();
        this.createCart();
    }

    /**
     * Gets a reference to the shopping cart object.
     * @returns An object containing all seats added to the shopping cart,
     * mapped by seat type.
     */
    public getCart(): { [key: string]: SeatIndex[] } {
        return this.cart;
    }

    /**
     * Gets the total price of the selected seats.
     * @returns The total price.
     */
    public getTotal(): number {
        let total = 0;
        const keys = Object.keys(this.dict);
        for (const key of keys) {
            total += this.getSeatPrice(key) * this.dict[key].length;
        }

        return total;
    }

    /**
     * Gets the price for a specific type of seat.
     * @param type - The type of the seat.
     * @returns Price.
     */
    public getSeatPrice(type: string): number {
        for (const seatType of this.options.types) {
            if (seatType.type === type) {
                return seatType.price;
            }
        }

        throw new NotFoundError('Seat price not found.');
    }

    /**
     * Updates the shopping cart by adding, removing or updating a seat.
     * @param action - Action on the shopping cart ('remove' | 'add' | 'update').
     * @param id - Id of the seat in the dom.
     * @param type - New seat type.
     * @param previousType - Previous seat type.
     * @param emit - True to trigger onChange events.
     */
    public updateCart(action: string, id: string, type: string, previousType: string, emit: boolean): void {
        const name = this.map.getSeatName(id);
        const index = this.getIndexFromId(id);
        const price = type && !['available', 'disabled', 'reserved'].includes(type) ?
            this.getSeatPrice(type) :
            null;

        const current: SeatInfo = {
            id,
            index,
            name,
            price,
            type,
        };
        const previous: SeatInfo = {
            id,
            index,
            name,
            price: previousType && !['available', 'disabled', 'reserved'].includes(previousType) ?
                this.getSeatPrice(previousType) :
                null,
            type: previousType,
        };

        this.updateCartObject();

        if (action === 'remove') {
            if (this.cartTable) {
                this.cartTable.removeItem(id);
            }

            if (emit) {
                this.map.onChangeEventListeners.forEach(el => el({
                    action,
                    current,
                    previous,
                }));
            }
        } else if (action === 'add') {
            if (this.cartTable) {
                const seatType = this.options.types.find(x => x.type === current.type);

                if (!seatType) {
                    throw new NotFoundError('Seat type not found.');
                }

                this.cartTable.addItem(current, seatType, this.deleteClick(CartItemUI.id(current.id)));
            }

            if (emit) {
                this.map.onChangeEventListeners.forEach(el => el({
                    action,
                    current,
                    previous,
                }));
            }
        } else if (action === 'update') {
            if (this.cartTable) {
                const seatType = this.options.types.find(x => x.type === current.type);

                if (!seatType) {
                    throw new NotFoundError('Seat type not found.');
                }

                this.cartTable.updateItem(current, seatType);
            }

            if (emit) {
                this.map.onChangeEventListeners.forEach(el => el({
                    action,
                    current,
                    previous,
                }));
            }
        }
    }

    /**
     * Adds a seat to the shopping cart dictionary.
     * @param id - The dom id of the seat in the seatmap.
     * @param type - The type of the seat.
     * @returns True if the seat is added correctly otherwise false.
     */
    public addToDict(id: string, type: string): boolean {
        if (type in this.dict) {
            if ({}.hasOwnProperty.call(this.dict, type)) {
                this.dict[type].push(id);
                return true;
            }
        }

        return false;
    }

    /**
     * Removes a seat from the shopping cart dictionary containing it.
     * @param id - The dom id of the seat in the seatmap.
     * @param type - The type of the seat.
     * @returns True if the seat is removed correctly otherwise false.
     */
    public removeFromDict(id: string, type: string): boolean {
        if (type !== undefined) {
            if (type in this.dict) {
                const index = this.dict[type].indexOf(id);
                if (index > -1) {
                    this.dict[type].splice(index, 1);
                    return true;
                }
            }
        } else {
            const keys = Object.keys(this.dict);
            for (const key of keys) {
                if (this.removeFromDict(id, key)) {
                    return true;
                }
            }
        }

        return false;
    }

    public updateTotal(): void {
        this.cartFooter?.updateTotal(this.getTotal());
        this.cartHeader?.updateCounter(this.cartTable?.countItems() || 0);
    }

    /**
     * Creates the shopping cart.
     */
    private createCart(): void {
        if (this.options.cart) {
            const cartContainer = new ContainerUI('cart', 'column');

            const cartTableContainer = document.createElement('div');
            cartTableContainer.classList.add('sc-cart');
            cartTableContainer.style.width = `${this.options.cart.width}px`;
            cartTableContainer.style.height = `${this.options.cart.height}px`;

            this.cartTable = new CartTableUI(
                this.options.cart.currency,
                this.options.assets?.path,
            );

            this.loadCartItems();

            cartTableContainer.appendChild(this.cartTable?.element);

            const itemsCount = this.cartTable?.countItems();
            this.cartFooter = new CartFooterUI(
                this.getTotal(),
                this.options.cart?.currency,
                this.options.assets?.path,
                this.deleteAllClick,
            );

            this.cartHeader = new CartHeaderUI(itemsCount, this.options.assets?.path);

            cartContainer.element.appendChild(this.cartHeader.element);
            cartContainer.element.appendChild(cartTableContainer);
            cartContainer.element.appendChild(this.cartFooter.element);

            const cart = document.getElementById(this.options.cart.id);
            if (cart) {
                cart.appendChild(cartContainer.element);
            }
        }
    }

    /**
     * Updates shopping cart object: values stored into dict are mapped to fit
     * cart type and format. (See private variables dict and cart.)
     */
    private updateCartObject(): void {
        const keys = Object.keys(this.dict);
        for (const s of keys) {
            this.cart[s] = this.dict[s].map(x => this.getIndexFromId(x));
        }
    }

    /**
     * This function is fired when the "delete all" button is clicked in the shopping cart.
     */
    private deleteAllClick(): void {
        const clearEvent: ClearEvent = {
            seats: [],
        };

        const keys = Object.keys(this.dict);

        // release all selected seats and remove them from dictionary
        for (const key of keys) {
            for (const id of this.dict[key]) {
                this.map.releaseSeat(id);

                if (this.map.onClearEventListeners.length > 0) {
                    const index = this.getIndexFromId(id);
                    const seatName = this.map.getSeatName(id);
                    const type = this.map.getSeatType(id);

                    const current: SeatInfo = {
                        id,
                        index,
                        name: seatName,
                        price: null,
                        type: 'available',
                    };
                    const previous: SeatInfo = {
                        id,
                        index,
                        name: seatName,
                        price: this.getSeatPrice(type),
                        type,
                    };

                    clearEvent.seats.push({ current, previous });
                }
            }

            // empty array, fastest way instead of removing each seat
            this.dict[key] = [];
        }

        // empty shopping cart, fastest way instead of removing each item
        if (this.cartTable) {
            utils.emptyElement(this.cartTable.element);
        }

        this.cartFooter?.updateTotal(this.getTotal());
        this.cartHeader?.updateCounter(this.cartTable?.countItems() || 0);

        this.map.onClearEventListeners.forEach(el => el(clearEvent));
    }

    /**
     * This function is fired when a delete button is clicked in the shopping cart.
     * @param id - Deleted item id.
     */
    private deleteClick(itemId: string): () => void {
        return (): void => {
            const parentElement = document.getElementById(itemId);
            if (parentElement) {
                parentElement.remove();
            }

            const id = itemId.split('-')[1];
            const type = this.map.getSeatType(id);

            this.map.releaseSeat(id);
            this.removeFromDict(id, type);

            this.cartFooter?.updateTotal(this.getTotal());
            this.cartHeader?.updateCounter(this.cartTable?.countItems() || 0);

            // fire event
            if (this.map.onChangeEventListeners.length > 0) {
                const index = this.getIndexFromId(id);
                const seatName = this.map.getSeatName(id);

                const current: SeatInfo = {
                    id,
                    index,
                    name: seatName,
                    price: null,
                    type: 'available',
                };
                const previous: SeatInfo = {
                    id,
                    index,
                    name: seatName,
                    price: this.getSeatPrice(type),
                    type,
                };

                this.map.onChangeEventListeners.forEach(el => el({
                    action: 'remove',
                    current,
                    previous,
                }));
            }
        };
    }

    /**
     * Loads seats into dict.
     */
    private loadCart(): void {
        // create array of seat types
        this.initializeSeatTypes();

        // Add selected seats to shopping cart
        for (const seatType of this.options.types) {
            if (seatType.selected) {
                const type = seatType.type;

                for (const index of seatType.selected) {
                    const id = SeatUI.id(index.row, index.col);
                    // add to shopping cart
                    this.addToDict(id, type);
                }
            }
        }

        this.updateCartObject();
    }

    /**
     * Loads seats, given with seat types, into the shopping cart.
     * @returns Number of loaded items.
     */
    private loadCartItems(): void {
        for (const seatType of this.options.types) {
            if (seatType.selected) {
                const type = seatType.type;
                const price = seatType.price;

                for (const index of seatType.selected) {
                    const id = SeatUI.id(index.row, index.col);
                    const name = this.map.getSeatName(id);

                    const seat: SeatInfo = {
                        id,
                        index,
                        name,
                        price,
                        type,
                    };
                    this.cartTable?.addItem(seat, seatType, this.deleteClick(CartItemUI.id(id)));
                }
            }
        }
    }

    /**
     * Initializes the type of seats that can be clicked and
     * the types of seat that can be added to the shopping cart
     * from the options object.
     */
    private initializeSeatTypes(): void {
        // update types of seat
        this.types = ['available'];
        this.dict = {};

        for (const option of this.options.types) {
            this.types.push(option.type);
            this.dict[option.type] = [];
        }
    }

    /**
     * Converts a seat id to a seat index.
     * @param id - Seat id to map.
     * @returns Seat index.
     */
    private getIndexFromId(id: string): SeatIndex {
        const values = id.split('_').map(val => parseInt(val, 10));

        return { row: values[0], col: values[1] };
    }
}

export default CartUI;
