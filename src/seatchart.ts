import { ChangeEvent, ClearEvent } from "components/events";
import { Options } from "components/options";
import { Seat } from "components/seat";

/**
 * Callback to generate a seat name.
 *
 * @function seatNameCallback
 *
 * @param {object} row
 * @param {number} row.index - Row index (starts from 0).
 * @param {boolean} row.disabled - True if current row is disabled.
 * @param {number} row.disabledCount - Number of disabled rows till that one (including current one if disabled).
 *
 * @param {object} column
 * @param {number} column.index - Column index (starts from 0).
 * @param {boolean} column.disabled - True if current column is disabled.
 * @param {number} column.disabledCount - Number of disabled columns till that one (including current one if disabled).
 *
 * @returns {string} Seat name. Return null or undefined if empty.
 */

/**
 * Callback to generate a row name.
 *
 * @function rowNameCallback
 *
 * @param {number} index - Row index (starts from 0).
 * @param {boolean} disabled - True if current row is disabled.
 * @param {number} disabledCount - Number of disabled rows till that one (including current one if disabled).
 *
 * @returns {string} Row name. Return null or undefined if empty.
 */

/**
 * Callback to generate a column name.
 *
 * @function columnNameCallback
 *
 * @param {number} index - Column index (starts from 0).
 * @param {boolean} disabled - True if current column is disabled.
 * @param {number} disabledCount - Number of disabled columns till that one (including current one if disabled).
 *
 * @returns {string} Column name. Return null or undefined if empty.
 *
 */

/**
 * @typedef {Object} Seat
 * @property {string} type - Seat type.
 * @property {number} id - Seat id.
 * @property {number} index - Seat index.
 * @property {string} name - Seat name.
 * @property {number} price - Seat price.
 */

/**
 * @typedef {Array.<Object>} ClearEvent
 * @property {Seat} current - Current seat info.
 * @property {Seat} previous - Seat info previous to the event.
 */

/**
 * @typedef {Object} ChangeEvent
 * @property {string} action - Action on seat ('add', 'remove' or 'update').
 * @property {Seat} current - Current seat info.
 * @property {Seat} previous - Seat info previous to the event.
 */

class Seatchart {
    /**
     * Triggered when a seat is selected or unselected.
     *
     * @method
     * @param {ChangeEvent} e - A change event.
     * @listens ChangeEvent
     */
    public onChange: ((e: ChangeEvent) => void) | undefined;

    /**
     * Triggered when all seats are removed with the 'delete all' button in the shopping cart.
     *
     * @method
     * @param {ClearEvent} e - A clear event.
     * @listens ClearEvent
     */
    public onClear: ((e: ClearEvent) => void) | undefined;

    /**
     * Seatchart options.
     * @private
     */
    private options: Options;

    /**
     * An object containing all seats added to the shopping cart, mapped by seat type.
     * @type {Object<string, Array.<number>>}
     * @private
     */
    private cart: { [key: string]: number[] } = {};

    /**
     * A string containing all the letters of the english alphabet.
     * @type {string}
     * @private
     */
    private alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    /**
     * An array of strings containing all the pickable seat types, "available" included.
     * @type {Array.<string>}
     * @private
     */
    private types: string[] = [];

    /**
     * The main div container containing all the shopping cart elements.
     * @type {HTMLDivElement}
     * @private
     */
    private cartTable: HTMLDivElement | undefined;

    /**
     * The text that shows the total cost of the items in the shopping cart.
     * @type {HTMLHeadingElement}
     * @private
     */
    private cartTotal: HTMLHeadingElement | undefined;

    /**
     * Text that show total number of items in the shopping cart.
     * @type {HTMLHeadingElement}
     * @private
     */
    private cartItemsCounter: HTMLHeadingElement | undefined;

    /**
     * A dictionary containing all seats added to the shopping cart, mapped by seat type.
     * Each string is composed by row (r) and column (c) indexed in the following format: "r_c",
     * which is the id of the seat in the document.
     * @type {Object<string, Array.<number>>}
     * @property {string} - Seat type.
     * @property {Array.<number>} - Ids of the seats added to the cart.
     * @private
     */
    private cartDict: { [key: string]: string[] } = {};

    private defaultTextColor = 'white';
    private defaultCurrency = '€';

    /**
     * Creates a seatchart.
     * @constructor
     *
     * @param {Object} options - Seatmap options.
     *
     *
     * @param {Object} options.map - Map options.
     * @param {string} options.map.id - Container id.
     * @param {number} options.map.rows - Number of rows.
     * @param {number} options.map.columns - Number of columns.
     * @param {seatNameCallback} [options.map.seatName] - Seat name generator.
     *
     * @param {Object} [options.map.reserved] - Array of reserved seats.
     * @param {Array.<number>} [options.map.reserved.seats] - Array of the reserved seats.
     *
     * @param {Object} [options.map.disabled] - Disabled seats options.
     * @param {Array.<number>} [options.map.disabled.seats] - Array of the disabled seats.
     * @param {Array.<number>} [options.map.disabled.rows] - Array of the disabled rows of seats.
     *
     * @param {Array.<number>} [options.map.disabled.columns] - Array of the disabled columns of seats.
     *
     * @param {Object} [options.map.indexes] - Indexes options.
     *
     * @param {Object} [options.map.indexes.rows] - Rows index options.
     * @param {boolean} [options.map.indexes.rows.visible = true] - Row index visibility.
     * @param {string} [options.map.indexes.rows.position = 'left'] - Row index position.
     * @param {rowNameCallback} [options.map.indexes.rows.name] - Row name generator.
     *
     * @param {Object} [options.map.indexes.columns] - Columns index options.
     * @param {boolean} [options.map.indexes.columns.visible = true] - Column index visibility.
     * @param {string} [options.map.indexes.columns.position = 'top'] - Column index position.
     * @param {columnNameCallback} [options.map.indexes.columns.name] - Column name generator.
     *
     * @param {Object} [options.map.front] - Front header options.
     * @param {boolean} [options.map.front.visible = true] - Front header visibility.
     *
     *
     * @param {Array.<Object>} options.types - Seat types options.
     * @param {string} options.types.type - Name of seat type.
     * @param {string} options.types.backgroundColor - Background color of the defined seat type.
     * @param {number} options.types.price - Price of the defined seat type.
     * @param {string} [options.types.textColor = 'white'] - Text color of the defined seat type.
     * @param {Array.<number>} [options.types.selected] - Selected seats of the defined seat type.
     *
     *
     * @param {Array.<Object>} [options.cart] - Cart options.
     * @param {string} options.cart.id - Container id.
     * @param {string} [options.cart.height] - Cart height.
     * @param {string} [options.cart.width] - Cart width.
     * @param {string} [options.cart.currency = '€'] - Current currency.
     *
     *
     * @param {string} [options.legend] - Legend options.
     * @param {string} options.legend.id - Container id.
     *
     *
     * @param {Array.<Object>} [options.assets] - Assets options.
     * @param {string} [options.assets.path] - Path to assets.
     *
     */
    constructor(options: Options) {
        this.options = options;

        // check options.map parameter
        if (options.map === undefined) {
            throw new Error("Invalid parameter 'options.map' supplied to Seatchart. Cannot be undefined.");
        } else if (typeof options.map !== 'object') {
            throw new Error("Invalid parameter 'options.map' supplied to Seatchart. Must be an object.");
        } else if (!{}.hasOwnProperty.call(options.map, 'id')) {
            throw new Error("Invalid parameter 'options.map' supplied to Seatchart. " +
                "'id' property cannot be undefined.");
        } else if (!{}.hasOwnProperty.call(options.map, 'rows') || !{}.hasOwnProperty.call(options.map, 'columns')) {
            throw new Error("Invalid parameter 'options.map' supplied to Seatchart. " +
                "'row' and 'columns' properties cannot be undefined.");
        } else if (options.map.rows > 25 || options.map.columns > 25) {
            throw new Error("Invalid parameter 'options.map' supplied to Seatchart. " +
                "'row' and 'columns' properties cannot be integers greater than 25.");
        } else if (options.map.rows < 2 || options.map.columns < 2) {
            throw new Error("Invalid parameter 'options.map' supplied to Seatchart. " +
                "'row' and 'columns' properties cannot be integers smaller than 2.");
        }

        // check options.types parameter
        if (options.types === undefined) {
            throw new Error("Invalid parameter 'options.types' supplied to Seatchart. Cannot be undefined.");
            // check if options.types is an array and contains at least one element
        } else if (!Array.isArray(options.types) || options.types.length < 1 || typeof options.types[0] !== 'object') {
            throw new Error("Invalid parameter 'options.types' supplied to Seatchart. " +
                'Must be an array of objects containing at least one element.');
        } else {
            // check if all elements have the needed attribute and contain the right type of value
            for (let i = 0; i < options.types.length; i += 1) {
                if (!{}.hasOwnProperty.call(options.types[i], 'type') ||
                    !{}.hasOwnProperty.call(options.types[i], 'backgroundColor') ||
                    !{}.hasOwnProperty.call(options.types[i], 'price')) {
                    throw new Error("Invalid parameter 'options.types' supplied to Seatchart. " +
                        `Element at index ${i} must contain a 'type', ` +
                        "a 'backgroundColor' and a 'price' property.");
                } else if (typeof options.types[i].type !== 'string') {
                    throw new Error("Invalid parameter 'options.types' supplied to Seatchart. " +
                        `'type' property at index ${i} must be a string.`);
                } else if (typeof options.types[i].backgroundColor !== 'string') {
                    throw new Error("Invalid parameter 'options.types' supplied to Seatchart. " +
                        `'backgroundColor' property at index ${i} must be a string.`);
                } else if (typeof options.types[i].price !== 'number') {
                    throw new Error("Invalid parameter 'options.types' supplied to Seatchart. " +
                        `'price' property at index ${i} must be a number.`);
                }
            }
        }

        // check the given input
        for (let x = 0; x < options.types.length; x += 1) {
            for (let y = x + 1; y < options.types.length; y += 1) {
                if (options.types[x].type.toLowerCase() === options.types[y].type.toLowerCase()) {
                    throw new Error(
                        "Invalid parameter 'options.types' supplied to Seatchart. " +
                        `'${options.types[x].type}' and '${options.types[y].type}' types are equal and must be different. ` +
                        'Types are case insensitive.'
                    );
                }
            }
        }

        this.deleteAllClick = this.deleteAllClick.bind(this);
        this.rowName = this.rowName.bind(this);
        this.columnName = this.columnName.bind(this);
        this.seatName = this.seatName.bind(this);

        this.loadCart();

        this.createMap();
        this.createCart();
        this.createLegend();
    }

    /**
    * Gets a reference to the shopping cart object.
    * @returns {Object<string, Array.<number>>} An object containing all seats added to the shopping cart, mapped by seat type.
    */
    public getCart(): { [key: string]: number[] } {
        return this.cart;
    };

    /**
     * Capitalizes the first letter and lowers all the others.
     * @param {string} value - The formatted string.
     * @private
     */
    private capitalizeFirstLetter(value: string): string {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

    /**
     * Computes the style of an element, it works even on ie :P.
     * @param {Element} el - The element for which we're getting the computed style.
     * @returns {CSSStyleDeclaration} The css of the element.
     * @private
     */
    private getStyle(el: Element): CSSStyleDeclaration {
        return window.getComputedStyle(el);
    }

    /**
     * Adds a seat to the shopping cart dictionary.
     * @param {string} id - The dom id of the seat in the seatmap.
     * @param {string} type - The type of the seat.
     * @returns {boolean} True if the seat is added correctly otherwise false.
     * @private
     */
    private addToCartDict(id: string, type: string): boolean {
        if (type in this.cartDict) {
            if ({}.hasOwnProperty.call(this.cartDict, type)) {
                this.cartDict[type].push(id);
                return true;
            }
        }

        return false;
    };

    /**
     * Initializes the type of seats that can be clicked and
     * the types of seat that can be added to the shopping cart
     * by using the json, containing the types, given in input.
     * @private
     */
    private initializeSeatTypes(): void {
        // update types of seat
        this.types = ['available'];
        this.cartDict = {};

        for (let i = 0; i < this.options.types.length; i += 1) {
            this.types.push(this.options.types[i].type);
            this.cartDict[this.options.types[i].type] = [];
        }
    };

    /**
     * Converts a seat id to an index.
     * @param {string} id - Seat id to map.
     * @returns {number} Seat index.
     * @private
     */
    private getIndexFromId(id: string): number {
        let values = id.split('_').map((id) => parseInt(id, 10));

        return (this.options.map.columns * values[0]) + values[1];
    };

    /**
     * Updates shopping cart object: values stored into cartDict are mapped to fit
     * cart type and format. (See private variables cartDict and cart.)
     * @private
     */
    private updateCartObject(): void {
        const keys = Object.keys(this.cartDict);
        for (let s of keys) {
            if ({}.hasOwnProperty.call(this.cartDict, s)) {
                this.cart[s] = this.cartDict[s].map(x => this.getIndexFromId(x));
            }
        }
    };

    /**
     * Loads seats into cartDict.
     * @private
     */
    private loadCart(): void {
        // create array of seat types
        this.initializeSeatTypes();

        // Add selected seats to shopping cart
        for (let n = 0; n < this.options.types.length; n += 1) {
            let seatType = this.options.types[n];

            if (seatType.selected) {
                let type = seatType.type;

                for (let l = 0; l < seatType.selected.length; l += 1) {
                    let index = seatType.selected[l];
                    let id = `${Math.floor(index / this.options.map.columns)}_${index % this.options.map.columns}`;
                    // add to shopping cart
                    this.addToCartDict(id, type);
                }
            }
        }

        this.updateCartObject();
    };

    /**
     * Create a delete button for a shopping cart item.
     * @returns {HTMLDivElement} The delete button.
     * @private
     */
    private createScDeleteButton(): HTMLDivElement {
        let binImg = document.createElement('img');
        binImg.src = this.options.assets?.path ?
            `${this.options.assets.path}/bin.svg` :
            '../assets/bin.svg';

        let deleteBtn = document.createElement('div');
        deleteBtn.className = 'sc-cart-delete';
        deleteBtn.appendChild(binImg);

        return deleteBtn;
    };

    /**
     * Gets the name of a seat.
     * @param {string} id - The dom id of the seat in the seatmap.
     * @returns {string} The name.
     * @private
     */
    private getSeatName(id: string): string {
        const element = document.getElementById(id);
        if (element?.textContent) {
            return element.textContent;
        }

        throw new Error('Seat name not found.');
    };

    /**
     * Gets the type of a seat.
     * @param {string} id - The dom id of the seat in the seatmap.
     * @returns {string} The type.
     * @private
     */
    private getSeatType(id: string): string {
        const keys = Object.keys(this.cartDict);
        for (let key of keys) {
            if (this.cartDict[key].indexOf(id) >= 0) {
                return key;
            }
        }

        throw new Error('Seat type not found.');
    };

    /**
     * Makes a seat available,
     * @param {string} id - The dom id of the seat in the seatmap.
     * @private
     */
    private releaseSeat(id: string): void {
        let seat = document.getElementById(id);

        if (seat) {
            seat.style.cssText = '';
            seat.className = 'sc-seat available';
        }
    };

    /**
     * Removes a seat from the shopping cart dictionary containing it.
     * @param {string} id - The dom id of the seat in the seatmap.
     * @param {string} type - The type of the seat.
     * @returns {boolean} True if the seat is removed correctly otherwise false.
     * @private
     */
    private removeFromCartDict(id: string, type: string): boolean {
        if (type !== undefined) {
            if (type in this.cartDict) {
                let index = this.cartDict[type].indexOf(id);
                if (index > -1) {
                    this.cartDict[type].splice(index, 1);
                    return true;
                }
            }
        } else {
            const keys = Object.keys(this.cartDict);
            for (let key of keys) {
                if (this.removeFromCartDict(id, key)) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Updates the total price and items counter in the shopping cart.
     * @private
     */
    private updateTotal(): void {
        if (this.cartTotal) {
            let currency = this.options.cart?.currency || this.defaultCurrency;
            this.cartTotal.textContent = `Total: ${currency}${this.getTotal().toFixed(2)}`;
        }

        if (this.cartItemsCounter && this.cartTable) {
            this.cartItemsCounter.textContent = `(${this.cartTable.childNodes.length})`;
        }
    };

    /**
     * This function is fired when a delete button is clicked in the shopping cart.
     * @private
     */
    private deleteClick = (sc: Seatchart) => function deleteClick(this: any): void {
        let column = this.parentNode;
        let item = column.parentNode;
        let parentId = item.getAttribute('id');

        let parentElement = document.getElementById(parentId);
        if (parentElement) {
            parentElement.outerHTML = '';
        }

        let id = parentId.split('-')[1];
        let type = sc.getSeatType(id);

        sc.releaseSeat(id);
        sc.removeFromCartDict(id, type);
        sc.updateTotal();

        // fire event
        if (sc.onChange != null) {
            let index = sc.getIndexFromId(id);
            let seatName = sc.getSeatName(id);

            let current: Seat = {
                type: 'available',
                id: id,
                index: index,
                name: seatName,
                price: null
            };
            let previous: Seat = {
                type: type,
                id: id,
                index: index,
                name: seatName,
                price: sc.getPrice(type)
            };

            sc.onChange({
                action: 'remove',
                current,
                previous,
            });
        }
    };

    /**
     * Creates a ticket to place into the shopping cart.
     * @param {Seat} seat - Seat info.
     * @returns {HTMLDivElement} The ticket.
     * @private
     */
    private createTicket(seat: Seat): HTMLDivElement {
        let seatConfig = this.options.types.find((x) => x.type === seat.type);

        if (!seatConfig) {
            throw new Error(`Options for seat type '${seat.type}' not found.`);
        }

        let ticket = document.createElement('div');
        ticket.className = 'sc-ticket';
        ticket.style.color = seatConfig.textColor || this.defaultTextColor;
        ticket.style.backgroundColor = seatConfig.backgroundColor;

        let stripes = document.createElement('div');
        stripes.className = 'sc-ticket-stripes';

        let seatName = document.createElement('div');
        seatName.textContent = seat.name;
        seatName.className = 'sc-cart-seat-name';

        let seatType = document.createElement('div');
        seatType.textContent = this.capitalizeFirstLetter(seat.type);
        seatType.className = 'sc-cart-seat-type';

        ticket.appendChild(stripes);
        ticket.appendChild(seatName);
        ticket.appendChild(seatType);
        ticket.appendChild(stripes.cloneNode(true));

        return ticket;
    };

    /**
     * Creates a shopping cart item.
     * @param {Seat} seat - Seat info.
     * @returns {HTMLDivElement} The shopping cart item.
     * @private
     */
    private createCartItem(seat: Seat): HTMLDivElement {
        if (!seat.price) {
            throw new Error('Seat price cannot be null or undefined.');
        }

        let item = document.createElement('tr');

        let ticketTd = document.createElement('td');
        ticketTd.className = 'sc-ticket-container';

        let ticket = this.createTicket(seat);
        ticketTd.appendChild(ticket);

        let seatPrice = document.createElement('td');
        let currency = this.options.cart?.currency || this.defaultCurrency;
        seatPrice.textContent = `${currency}${seat.price.toFixed(2)}`;

        let deleteTd = document.createElement('td');
        let deleteBtn = this.createScDeleteButton();
        deleteBtn.onclick = this.deleteClick(this);

        deleteTd.appendChild(deleteBtn);

        item.setAttribute('id', `item-${seat.id}`);
        item.appendChild(ticketTd);
        item.appendChild(seatPrice);
        item.appendChild(deleteTd);

        return item;
    };

    /**
     * Updates the shopping cart by adding, removing or updating a seat.
     * @param {string} action - Action on the shopping cart ('remove' | 'add' | 'update').
     * @param {string} id - Id of the seat in the dom.
     * @param {string} type - New seat type.
     * @param {string} previousType - Previous seat type.
     * @param {boolean} emit - True to trigger onChange events.
     * @private
     */
    private updateCart(action: string, id: string, type: string, previousType: string, emit: boolean): void {
        let name = this.getSeatName(id);
        let index = this.getIndexFromId(id);
        let price = type && ['available', 'disabled', 'reserved'].indexOf(type) < 0 ?
            this.getPrice(type) :
            null;

        let current: Seat = {
            type,
            id: id,
            index: index,
            name,
            price
        };
        let previous: Seat = {
            type: previousType,
            id: id,
            index: index,
            name,
            price: previousType && ['available', 'disabled', 'reserved'].indexOf(previousType) < 0 ?
                this.getPrice(previousType) :
                null
        };

        let cartItem;

        this.updateCartObject();

        if (action === 'remove') {
            if (this.cartTable) {
                const itemElement = document.getElementById(`item-${id}`);
                if (itemElement) {
                    itemElement.outerHTML = '';
                }
            }

            if (emit && this.onChange) {
                this.onChange({
                    action,
                    current,
                    previous
                });
            }
        } else if (action === 'add') {
            if (this.cartTable) {
                cartItem = this.createCartItem(current);
                this.cartTable.appendChild(cartItem);
            }

            if (emit && this.onChange) {
                this.onChange({
                    action: action,
                    current: current,
                    previous: previous
                });
            }
        } else if (action === 'update') {
            if (this.cartTable) {
                cartItem = document.getElementById(`item-${id}`);

                if (cartItem) {
                    let itemContent = cartItem.getElementsByTagName('td');

                    let seatConfig = this.options.types.find((x) => x.type === current.type);

                    if (seatConfig) {
                        let ticket = <HTMLElement> itemContent[0].getElementsByClassName('sc-ticket')[0];
                        ticket.style.backgroundColor = seatConfig.backgroundColor;
                        ticket.style.color = seatConfig.textColor || this.defaultTextColor;

                        let ticketType = ticket.getElementsByClassName('sc-cart-seat-type')[0];
                        ticketType.textContent = this.capitalizeFirstLetter(current.type);

                        let ticketPrice = itemContent[1];

                        if (current.price) {
                            let currency = this.options.cart?.currency || '€';
                            ticketPrice.textContent = `${currency}${current.price.toFixed(2)}`;
                        }
                    }
                }
            }

            if (emit && this.onChange) {
                this.onChange({
                    action: action,
                    current: current,
                    previous: previous
                });
            }
        }
    };

    /**
     * Creates a title.
     * @param {string} content - The content of the title.
     * @returns {HTMLHeadingElement} The title.
     * @private
     */
    private createTitle(content: string): HTMLHeadingElement {
        let title = document.createElement('h3');
        title.textContent = content;
        title.className = 'sc-title';

        return title;
    };

    /**
     * Creates a title with an icon.
     * @param {string} content - The title.
     * @param {string} src - The source path of the icon.
     * @param {string} alt - The text to be displed when the image isn't loaded properly.
     * @returns {HTMLDivElement} The iconed title.
     * @private
     */
    private createIconedTitle(content: string, src: string, alt: string): HTMLDivElement {
        let container = document.createElement('div');
        let icon = document.createElement('img');
        icon.src = src;
        icon.alt = alt;

        let title = this.createTitle(content);
        container.className = title.className;
        title.className = '';

        container.appendChild(icon);
        container.appendChild(title);

        return container;
    };

    /**
     * This function is fired when a seat is clicked in the seatmap.
     * @private
     */
    private seatClick = (sc: Seatchart) => function seatClick(this: HTMLElement): void {
        // clone array because it's modified by adding and removing classes
        let currentClassList = [];
        for (let j = 0; j < this.classList.length; j += 1) {
            currentClassList.push(this.classList[j]);
        }

        for (let i = 0; i < currentClassList.length; i += 1) {
            let currentClass = currentClassList[i];
            let newClass;

            if (currentClass !== 'sc-seat' && currentClass !== 'clicked') {
                // find index of current
                let index = sc.types.indexOf(currentClass);

                // if the current class matches a type
                // then select the new one
                if (index !== -1) {
                    this.classList.remove(sc.types[index]);
                    index += 1;

                    if (index === sc.types.length) {
                        index = 0;
                    }

                    newClass = sc.types[index];

                    this.style.backgroundColor = '';
                    this.style.color = '';
                    this.classList.add(newClass);

                    // if the class isn't available then apply the background-color in the config
                    if (newClass !== 'available') {
                        // decrease it because there's one less element in options.types
                        // which is 'available', that already exists
                        index -= 1;
                        if (index < 0) {
                            index = sc.options.types.length - 1;
                        }

                        this.classList.add('clicked');
                        this.style.backgroundColor = sc.options.types[index].backgroundColor;
                        this.style.color = sc.options.types[index].textColor || sc.defaultTextColor;
                    } else {
                        // otherwise remove the class 'clicked'
                        // since available has it's own style
                        this.classList.remove('clicked');
                    }

                    // this has to be done after updating the shopping cart
                    // so the event is fired just once the seat style is really updated
                    if (currentClass === 'available') {
                        if (sc.addToCartDict(this.id, newClass)) {
                            sc.updateCart('add', this.id, newClass, currentClass, true);
                        }
                    } else if (newClass === 'available') {
                        if (sc.removeFromCartDict(this.id, currentClass)) {
                            sc.updateCart('remove', this.id, newClass, currentClass, true);
                        }
                    } else if (sc.addToCartDict(this.id, newClass) &&
                        sc.removeFromCartDict(this.id, currentClass)) {
                        sc.updateCart('update', this.id, newClass, currentClass, true);
                    }
                }
            }
        }

        sc.updateTotal();
    };

    /**
     * This function is fired when a seat is right clicked to be released.
     * @private
     */
    private rightClickDelete = (sc: Seatchart) => function rightClickDelete(this: any, e: Event): boolean {
        e.preventDefault();

        let type = sc.getSeatType(this.id);

        // it means it has no type and it's available, then there's nothing to delete
        if (type !== undefined) {
            sc.releaseSeat(this.id);
            // remove from virtual sc
            sc.removeFromCartDict(this.id, type);

            // there's no need to fire onChange event since this function fires
            // the event after removing the seat from shopping cart
            sc.updateCart('remove', this.id, 'available', type, true);
            sc.updateTotal();
        }

        // so the default context menu isn't showed
        return false;
    };

    /**
     * Generates a row name.
     * @param {number} row - Row index (starts from 0).
     * @param {boolean} disabled - True if current row is disabled.
     * @param {number} disabledCount - Number of disabled rows till that one (including current one if disabled).
     * @returns {string} Row name. Return null or undefined if empty.
     * @private
     */
    private rowName(index: number, disabled: boolean, disabledCount: number): string | undefined {
        if (!disabled) {
            return this.alphabet[index - disabledCount];
        }
    };

    /**
     * Generates a column name.
     * @param {number} column - Column index (starts from 0).
     * @param {boolean} disabled - True if current column is disabled.
     * @param {number} disabledCount - Number of disabled columns till that one (including current one if disabled).
     * @returns {string} Column name. Return null or undefined if empty.
     * @private
     */
    private columnName(index: number, disabled: boolean, disabledCount: number): string | undefined {
        if (!disabled) {
            return ((index - disabledCount) + 1).toString();
        }
    };

    /**
     * Generates a seat name.
     * @param {object} row
     * @param {number} row.index - Row index (starts from 0).
     * @param {boolean} row.disabled - True if current row is disabled.
     * @param {number} row.disabledCount - Number of disabled rows till that one (including current one if disabled).
     *
     * @param {object} column
     * @param {number} column.index - Column index (starts from 0).
     * @param {boolean} column.disabled - True if current column is disabled.
     * @param {number} column.disabledCount - Number of disabled columns till that one (including current one if disabled).
     *
     * @returns {string} Seat name. Return null if empty.
     * @private
     */
    private seatName(
        row: { index: number, disabled: boolean, disabledCount: number },
        column: { index: number, disabled: boolean, disabledCount: number }
    ): string | undefined {
        if (!row.disabled && !column.disabled) {
            let rowIndex = this.rowName(row.index, row.disabled, row.disabledCount);
            let columnIndex = this.columnName(column.index, column.disabled, column.disabledCount);

            return `${rowIndex}${columnIndex}`;
        }
    };

    /**
     * Creates a new seat.
     * @param {string} type - The type of the seat.
     * @param {string} content - The name representing the seat.
     * @param {string} seatId - The dom id of the seat in the seatmap.
     * @returns {HTMLDivElement} The seat.
     * @private
     */
    private createSeat(type: string, content: string | undefined, seatId: string): HTMLDivElement {
        let seat = document.createElement('div');
        seat.className = 'sc-seat ' + type;
        if (content) {
            seat.textContent = content;
        }

        // if seatId wasn't passed as argument then don't set it
        if (seatId !== undefined) {
            seat.setAttribute('id', seatId);

            // add click event just if it's a real seats (when it has and id)
            seat.addEventListener('click', this.seatClick(this));
            seat.addEventListener('contextmenu', this.rightClickDelete(this), false);
        }

        return seat;
    };

    /**
     * Creates a seat map row.
     * @returns {HTMLDivElement} The row.
     * @private
     */
    private createRow(): HTMLDivElement {
        let row = document.createElement('div');
        row.className = 'sc-map-row';

        return row;
    };

    /**
     * Creates the header of the seatmap containing the front indicator.
     * @returns {HTMLDivElement} The seatmap header.
     * @private
     */
    private createFrontHeader(): HTMLDivElement {
        // set the perfect width of the front indicator
        let front = document.createElement('div');
        front.textContent = 'Front';
        front.className = 'sc-front';

        return front;
    };

    /**
     * Creates a seatmap index.
     * @param {string} content - Index text content.
     * @returns {HTMLDivElement} The seatmap index.
     * @private
     */
    private createIndex(content: string): HTMLDivElement {
        let index = document.createElement('div');
        index.textContent = content;
        index.className = 'sc-index';

        return index;
    };

    /**
     * Creates a seatmap blank spot.
     * @returns {HTMLDivElement} The seatmap blank spot.
     * @private
     */
    private createBlank(): HTMLDivElement {
        let blank = document.createElement('div');
        blank.className = 'sc-seat blank';

        return blank;
    };

    /**
     * Creates a row containing all the row indexes.
     * @returns {HTMLDivElement} Row indexes.
     * @private
     */
    private createRowIndex(): HTMLDivElement {
        let rowIndex = document.createElement('div');
        rowIndex.className = 'sc-row-index';

        let disabled = this.options.map.disabled;
        let disabledCount = 0;

        let generateName = this.rowName;
        if (this.options.map.indexes?.rows?.name) {
            generateName = this.options.map.indexes.rows.name;
        }

        for (let i = 0; i < this.options.map.rows; i += 1) {
            let isRowDisabled = disabled && disabled.rows ? disabled.rows.indexOf(i) >= 0 : false;
            disabledCount = isRowDisabled ? disabledCount + 1 : disabledCount;

            let index = generateName(i, isRowDisabled, disabledCount);


            if (index) {
                rowIndex.appendChild(this.createIndex(index));
            } else {
                rowIndex.appendChild(this.createBlank());
            }
        }

        return rowIndex;
    };

    /**
     * Creates a row containing all the column indexes.
     * @returns {HTMLDivElement} Column indexes.
     * @private
     */
    private createColumnIndex(): HTMLDivElement {
        let columnIndex = document.createElement('div');
        columnIndex.className = 'sc-column-index';

        let disabled = this.options.map.disabled;
        let disabledCount = 0;

        let generateName = this.columnName;
        if (this.options.map.indexes?.columns?.name) {
            generateName = this.options.map.indexes.columns.name;
        }

        for (let i = 0; i < this.options.map.columns; i += 1) {
            let isColumnDisabled = (disabled?.columns && disabled.columns.indexOf(i) >= 0) || false;
            disabledCount = isColumnDisabled ? disabledCount + 1 : disabledCount;

            let index = generateName(i, isColumnDisabled, disabledCount);
            if (index) {
                columnIndex.appendChild(this.createIndex(index));
            } else {
                columnIndex.appendChild(this.createBlank());
            }
        }

        return columnIndex;
    };

    /**
     * Creates a container.
     * @param {string} name - Container name
     * @param {string} direction - Flex direction ('column', 'row', 'row-reverse' or 'column-reverse').
     * @param {string} [contentPosition] - Content position ('left', 'right', 'top' or 'bottom').
     * @returns {HTMLDivElement} The container.
     * @private
     */
    private createContainer(name: string | null, direction: string, contentPosition?: string): HTMLDivElement {
        if (['column', 'row', 'column-reverse', 'row-reverse'].indexOf(direction) < 0) {
            throw new Error("'direction' must have one of the following values: " +
                "'column', 'row', 'column-reverse', 'row-reverse'");
        }

        if (contentPosition && ['left', 'right', 'top', 'bottom'].indexOf(contentPosition) < 0) {
            throw new Error(
                "'contentPosition' must have one of the following values: " +
                "'left', 'right', 'top', 'bottom'"
            );
        }

        let container = document.createElement('div');

        if (name) {
            container.className = `sc-${name}-container`;
        }

        container.classList.add(`sc-container-${direction}`);

        if (contentPosition) {
            container.classList.add(`sc-${contentPosition}`);
        }

        return container;
    };

    /**
     * Removes all classes regarding the type applied to the seat.
     * @param {HTMLDivElement} seat - Seat element.
     * @private
     */
    private removeAllTypesApplied(seat: HTMLDivElement) {
        for (let i = 0; i < this.types.length; i += 1) {
            seat.classList.remove(this.types[i]);
        }
    };

    /**
     * Add to options each seat from disabled columns and rows.
     * @private
     */
    private addDisabledSeatsToOptions(): void {
        if (!this.options.map.disabled) {
            this.options.map.disabled = {};
        }

        if (!this.options.map.disabled?.seats) {
            this.options.map.disabled.seats = [];
        }

        // add disabled columns to disabled array
        let disabledColumns = this.options.map.disabled?.columns;
        if (disabledColumns) {
            for (let k = 0; k < disabledColumns.length; k += 1) {
                let disabledColumn = disabledColumns[k];
                for (let r = 0; r < this.options.map.rows; r += 1) {
                    this.options.map.disabled.seats.push((this.options.map.columns * r) + disabledColumn);
                }
            }
        }

        // add disabled rows to disabled array
        let disabledRows = this.options.map.disabled?.rows;
        if (disabledRows) {
            for (let m = 0; m < disabledRows.length; m += 1) {
                let disabledRow = disabledRows[m];
                for (let c = 0; c < this.options.map.columns; c += 1) {
                    this.options.map.disabled.seats.push((this.options.map.columns * disabledRow) + c);
                }
            }
        }
    };

    /**
     * Disables and reserves all seats given in the options.
     * @private
     */
    private disableAndReserveSeats(): void {
        const types: ('reserved' | 'disabled')[] = ['reserved', 'disabled'];

        for (let type of types) {
            let seats = this.options.map[type]?.seats;
            if (seats) {
                let columns = this.options.map.columns;

                for (let i = 0; i < seats.length; i += 1) {
                    let index = seats[i];
                    let id = `${Math.floor(index / columns)}_${index % columns}`;
                    let seat = <HTMLDivElement> document.getElementById(id);

                    if (seat != null) {
                        this.removeAllTypesApplied(seat);

                        if (type === 'disabled') {
                            seat.classList.add('blank');
                        } else if (type === 'reserved') {
                            seat.classList.add('unavailable');
                        }
                    }
                }
            }
        }
    };

    /**
     * Loads seats, given with seat types, into the shopping cart.
     * @returns {number} Number of loaded items.
     * @private
     */
    private loadCartItems(): number {
        let count = 0;

        for (let i = 0; i < this.options.types.length; i += 1) {
            let seatType = this.options.types[i];

            if (seatType.selected) {
                let type = seatType.type;
                let price = seatType.price;

                count += seatType.selected.length;

                for (let j = 0; j < seatType.selected.length; j += 1) {
                    let index = seatType.selected[j];
                    let row = Math.floor(index / this.options.map.columns);
                    let column = index % this.options.map.columns;
                    let id = `${row}_${column}`;
                    let name = this.getSeatName(id);

                    let seat: Seat = {
                        id,
                        name,
                        type,
                        price,
                        index,
                    };
                    let cartItem = this.createCartItem(seat);

                    if (this.cartTable) {
                        this.cartTable.appendChild(cartItem);
                    }
                }
            }
        }

        return count;
    };

    /**
     * Selects seats given with seat types.
     * @private
     */
    private selectSeats(): void {
        for (let n = 0; n < this.options.types.length; n += 1) {
            let seatType = this.options.types[n];

            if (seatType.selected) {
                let type = seatType.type;
                let backgroundColor = seatType.backgroundColor;
                let color = seatType.textColor || this.defaultTextColor;

                for (let l = 0; l < seatType.selected.length; l += 1) {
                    let index = seatType.selected[l];
                    let id = `${Math.floor(index / this.options.map.columns)}_${index % this.options.map.columns}`;

                    let element = document.getElementById(id);
                    if (element) {
                        // set background
                        element.classList.remove('available');
                        element.classList.add(type);
                        element.classList.add('clicked');
                        element.style.backgroundColor = backgroundColor;
                        element.style.color = color;
                    }
                }
            }
        }
    };

    /**
     * Gets the price for a specific type of seat.
     * @param {string} type - The type of the seat.
     * @returns {number} Price.
     */
    public getPrice(type: string): number {
        for (let i = 0; i < this.options.types.length; i += 1) {
            if (this.options.types[i].type === type) {
                return this.options.types[i].price;
            }
        }

        throw new Error('Seat price not found.');
    };

    /**
     * Gets the total price of the selected seats.
     * @returns {number} - The total price.
     */
    public getTotal(): number {
        let total = 0;
        const keys = Object.keys(this.cartDict);
        for (let key of keys) {
            total += this.getPrice(key) * this.cartDict[key].length;
        }

        return total;
    };

    /**
     * Checks whether a seat is a gap or not.
     * @param {number} seatIndex - Seat index.
     * @returns {boolean} True if it is, false otherwise.
     */
    public isGap(seatIndex: number): boolean {
        if (typeof seatIndex !== 'number' && Math.floor(seatIndex) === seatIndex) {
            throw new Error("Invalid parameter 'seatIndex' supplied to Seatchart.isGap(). It must be an integer.");
        } else if (seatIndex >= this.options.map.rows * this.options.map.columns) {
            throw new Error("Invalid parameter 'seatIndex' supplied to Seatchart.isGap(). Index is out of range.");
        }

        let row = Math.floor(seatIndex / this.options.map.columns);
        let col = seatIndex % this.options.map.columns;

        let seatId = `${row}_${col}`;

        // if current seat is disabled or reserved do not continue
        if ((this.options.map.disabled?.seats && this.options.map.disabled.seats.indexOf(seatIndex) >= 0) ||
            (this.options.map.disabled?.columns && this.options.map.disabled.columns.indexOf(col) >= 0) ||
            (this.options.map.disabled?.rows && this.options.map.disabled.rows.indexOf(row) >= 0) ||
            (this.options.map.reserved?.seats && this.options.map.reserved.seats.indexOf(seatIndex) >= 0)
        ) {
            return false;
        }

        const keys = Object.keys(this.cartDict);

        // if current seat is selected do not continue
        for (let key of keys) {
            if (this.cartDict[key].indexOf(seatId) >= 0) {
                return false;
            }
        }

        let colBefore = col - 1;
        let colAfter = col + 1;

        let seatBefore = seatIndex - 1;
        let seatAfter = seatIndex + 1;

        let isSeatBeforeDisabled = this.options.map.disabled?.seats ? this.options.map.disabled.seats.indexOf(seatBefore) >= 0 : false;
        let isSeatAfterDisabled = this.options.map.disabled?.seats ? this.options.map.disabled.seats.indexOf(seatAfter) >= 0 : false;

        let isSeatBeforeReserved = this.options.map.reserved?.seats ? this.options.map.reserved.seats.indexOf(seatBefore) >= 0 : false;
        let isSeatAfterReserved = this.options.map.reserved?.seats ? this.options.map.reserved.seats.indexOf(seatAfter) >= 0 : false;

        // if there's a disabled/reserved block before and after do not consider it a gap
        if ((isSeatBeforeDisabled && isSeatAfterDisabled) ||
            (isSeatBeforeReserved && isSeatAfterReserved) ||
            (isSeatBeforeReserved && isSeatAfterDisabled) ||
            (isSeatBeforeDisabled && isSeatAfterReserved)) {
            return false;
        }

        // if there's a disabled/reserved block before and no seats after because the seatchart ends or,
        // a disabled/reserved block after and no seats before, then do not consider it a gap
        if (((isSeatBeforeDisabled || isSeatBeforeReserved) && colAfter >= this.options.map.columns) ||
            (colBefore < 0 && (isSeatAfterDisabled || isSeatAfterReserved))) {
            return false;
        }

        let seatBeforeId = `${row}_${colBefore}`;
        let seatAfterId = `${row}_${colAfter}`;

        let isSeatBeforeSelected = false;
        let isSeatAfterSelected = false;

        // check if seat before and after are selected
        for (let type of keys) {
            if (!isSeatBeforeSelected) {
                isSeatBeforeSelected = this.cartDict[type].indexOf(seatBeforeId) >= 0;
            }

            if (!isSeatAfterSelected) {
                isSeatAfterSelected = this.cartDict[type].indexOf(seatAfterId) >= 0;
            }

            if (isSeatAfterSelected && isSeatBeforeSelected) {
                break;
            }
        }

        let isSeatBeforeUnavailable = colBefore < 0 ||
            (this.options.map.reserved?.seats && this.options.map.reserved.seats.indexOf(seatBefore) >= 0) ||
            isSeatBeforeDisabled ||
            isSeatBeforeSelected;

        let isSeatAfterUnavailable = colAfter >= this.options.map.columns ||
            (this.options.map.reserved?.seats && this.options.map.reserved.seats.indexOf(seatAfter) >= 0) ||
            isSeatAfterDisabled ||
            isSeatAfterSelected;

        return isSeatBeforeUnavailable && isSeatAfterUnavailable;
    };

    /**
     * Checks whether a seat creates a gap or not.
     * @param {number} seatIndex - Seat index.
     * @returns {boolean} True if it does, false otherwise.
     */
    public makesGap(seatIndex: number): boolean {
        if (typeof seatIndex !== 'number' && Math.floor(seatIndex) === seatIndex) {
            throw new Error(
                "Invalid parameter 'seatIndex' supplied to Seatchart.makesGap(). " +
                'It must be an integer.'
            );
        } else if (seatIndex >= this.options.map.rows * this.options.map.columns) {
            throw new Error(
                "Invalid parameter 'seatIndex' supplied to Seatchart.makesGap(). " +
                'Index is out of range.'
            );
        }

        let col = seatIndex % this.options.map.columns;

        let isSeatBeforeGap = false;
        if (seatIndex - 1 >= 0 && col > 0) {
            isSeatBeforeGap = this.isGap(seatIndex - 1);
        }

        let isSeatAfterGap = false;
        if ((seatIndex + 1 < this.options.map.columns * this.options.map.rows) && (col + 1 < this.options.map.columns)) {
            isSeatAfterGap = this.isGap(seatIndex + 1);
        }

        return isSeatBeforeGap || isSeatAfterGap;
    };

    /**
     * Gets all seats which represent a gap of the seat map.
     * @returns {Array.<number>} Array of indexes.
     */
    public getGaps(): number[] {
        let gaps = [];
        let count = this.options.map.columns * this.options.map.rows;
        for (let i = 0; i < count; i += 1) {
            if (this.isGap(i)) {
                gaps.push(i);
            }
        }

        return gaps;
    };

    /**
     * Gets seat info.
     * @param {number} index - Seat index.
     * @returns {Seat} Seat info.
     */
    public get(index: number): Seat {
        if (typeof index !== 'number' && Math.floor(index) === index) {
            throw new Error("Invalid parameter 'index' supplied to Seatchart.get(). It must be an integer.");
        } else if (index >= this.options.map.rows * this.options.map.columns) {
            throw new Error("Invalid parameter 'index' supplied to Seatchart.get(). Index is out of range.");
        }

        if (index < this.options.map.rows * this.options.map.columns) {
            let row = Math.floor(index / this.options.map.columns);
            let col = index % this.options.map.columns;
            let seatId = `${row}_${col}`;
            let name = this.getSeatName(seatId);

            // check if seat is reserved
            if (this.options.map.reserved?.seats && this.options.map.reserved.seats.indexOf(index) >= 0) {
                return {
                    type: 'reserved',
                    id: seatId,
                    index,
                    name,
                    price: null
                };
            }

            // check if seat is reserved
            if (this.options.map.disabled?.seats && this.options.map.disabled.seats.indexOf(index) >= 0) {
                return {
                    type: 'disabled',
                    id: seatId,
                    index,
                    name,
                    price: null
                };
            }

            const keys = Object.keys(this.cartDict);

            // check if seat is already selected
            for (let type of keys) {
                let price = this.getPrice(type);
                if (this.cartDict[type].indexOf(seatId) >= 0) {
                    return {
                        type,
                        id: seatId,
                        index,
                        name,
                        price
                    };
                }
            }

            return {
                type: 'available',
                id: seatId,
                index,
                name,
                price: null
            };
        }

        throw new Error("Invalid parameter 'index' supplied to Seatchart.get(). Index is out of range.");
    };

    /**
     * Set seat type.
     * @param {number} index - Index of the seat to update.
     * @param {string} type - New seat type ('disabled', 'reserved' and 'available' are supported too).
     * @param {boolean} [emit = false] - True to trigger onChange event.
     */
    public set(index: number, type: string, emit: boolean) {
        let seatType;
        if (typeof index !== 'number' && Math.floor(index) === index) {
            throw new Error("Invalid parameter 'index' supplied to Seatchart.set(). It must be an integer.");
        } else if (index >= this.options.map.rows * this.options.map.columns) {
            throw new Error("Invalid parameter 'index' supplied to Seatchart.set(). Index is out of range.");
        } else if (typeof type !== 'string') {
            throw new Error("Invalid parameter 'type' supplied to Seatchart.set(). It must be a string.");
        } else {
            seatType = this.options.types.find((x) => x.type === type);

            // check if type is valid
            if (!seatType || ['available', 'reserved', 'disabled'].indexOf(type) < 0) {
                throw new Error("Invalid parameter 'type' supplied to Seatchart.set().");
            } else if (emit && typeof emit !== 'boolean') {
                throw new Error("Invalid parameter 'emit' supplied to Seatchart.set(). It must be a boolean.");
            }
        }

        let seat = this.get(index);
        if (!seat || seat.type === type) {
            return;
        }

        let classes: { [key: string]: string } = {
            disabled: 'sc-blank',
            reserved: 'sc-unavailable'
        };

        let element = document.getElementById(seat.id);
        if (element) {
            if (seat.type === 'disabled' || seat.type === 'reserved') {
                let seats = this.options.map[seat.type]?.seats;
                let arrayIndex = seats && seats.indexOf(index);
                if (seats && arrayIndex && arrayIndex >= 0) {
                    seats.splice(arrayIndex, 1);
                }
            }

            if (type === 'reserved' || type === 'disabled') {
                this.options.map[type]?.seats && this.options.map[type]?.seats.push(index);
            }

            if (seat.type !== 'available' && seat.type !== 'disabled' && seat.type !== 'reserved') {
                if (type !== 'available' && type !== 'disabled' && type !== 'reserved') {
                    if (this.removeFromCartDict(seat.id, seat.type) && this.addToCartDict(seat.id, type)) {
                        element.classList.add('clicked');
                        element.style.setProperty('background-color', seatType.backgroundColor);
                        element.style.setProperty('color', seatType.textColor || this.defaultTextColor);
                        this.updateCart('update', seat.id, type, seat.type, emit);
                    }
                } else if (this.removeFromCartDict(seat.id, seat.type)) {
                    element.classList.remove('clicked');
                    element.style.removeProperty('background-color');
                    this.updateCart('remove', seat.id, type, seat.type, emit);
                }
            } else if (type !== 'available' && type !== 'disabled' && type !== 'reserved') {
                if (this.addToCartDict(seat.id, type)) {
                    element.classList.add('clicked');
                    element.style.setProperty('background-color', seatType.backgroundColor);
                    element.style.setProperty('color', seatType.textColor || this.defaultTextColor);
                    this.updateCart('add', seat.id, type, seat.type, emit);
                }
            }

            this.types.forEach((x) => classes[x] = x);

            element.classList.add(classes[type]);
            element.classList.remove(classes[seat.type]);
        }


        this.updateTotal();
    };

    /**
     * Creates a legend item and applies a type and a backgroundColor if needed.
     * @param {string} content - The text in the legend that explains the type of seat.
     * @param {string} type - The type of seat.
     * @param {string} [backgroundColor] - The background color of the item in the legend.
     * @returns {HTMLLIElement} The legend item.
     * @private
     */
    private createLegendItem(content: string, type: string, backgroundColor?: string): HTMLLIElement {
        let item = document.createElement('li');
        item.className = 'sc-legend-item';
        let itemStyle = document.createElement('div');
        itemStyle.className = `sc-seat legend-style ${type}`;
        let description = document.createElement('p');
        description.className = 'sc-legend-description';
        description.textContent = content;

        if (backgroundColor !== undefined) {
            itemStyle.className = `${itemStyle.className} clicked`;
            itemStyle.style.backgroundColor = backgroundColor;
        }

        item.appendChild(itemStyle);
        item.appendChild(description);

        return item;
    };

    /**
     * Creates a legend list.
     * @returns {HTMLUnorderedListElement} The legend list.
     * @private
     */
    private createLegendList(): HTMLUListElement {
        let list = document.createElement('ul');
        list.className = 'sc-legend';

        return list;
    };

    /**
     * Creates a small title.
     * @param {string} content - The content of the title.
     * @returns {HTMLHeadingElement} The small title.
     * @private
     */
    private createSmallTitle(content: string): HTMLHeadingElement {
        let smallTitle = document.createElement('h5');
        smallTitle.textContent = content;
        smallTitle.className = 'sc-small-title';

        return smallTitle;
    };

    /**
     * Creates the container of the items in the shopping cart.
     * @returns {HTMLDivElement} The container of the items.
     * @private
     */
    private createCartTable(): HTMLDivElement {
        let container = document.createElement('table');
        container.className = 'sc-cart-items';

        return container;
    };

    /**
     * This function is fired when the "delete all" button is clicked in the shopping cart.
     * @private
     */
    private deleteAllClick(): void {
        let removedSeats: ClearEvent = [];

        const keys = Object.keys(this.cartDict);

        // release all selected seats and remove them from dictionary
        for (let key of keys) {
            for (let i = 0; i < this.cartDict[key].length; i += 1) {
                let id = this.cartDict[key][i];

                this.releaseSeat(id);

                // fire event
                if (this.onChange != null) {
                    let index = this.getIndexFromId(id);
                    let seatName = this.getSeatName(id);
                    let type = this.getSeatType(id);

                    let current: Seat = {
                        type: 'available',
                        id: id,
                        index: index,
                        name: seatName,
                        price: null
                    };
                    let previous: Seat = {
                        type: type,
                        id: id,
                        index: index,
                        name: seatName,
                        price: this.getPrice(type)
                    };

                    removedSeats.push({ current, previous });
                }
            }

            // empty array, fastest way instead of removing each seat
            this.cartDict[key] = [];
        }

        // empty shopping cart, fastest way instead of removing each item
        if (this.cartTable) {
            this.cartTable.innerHTML = '';
        }

        this.updateTotal();

        if (this.onClear) {
            this.onClear(removedSeats);
        }
    };

    /**
     * Creates text that contains total number of items in the shopping cart.
     * @param {number} count - Number of item in the shopping cart.
     * @returns {HTMLDivElement} The total and "delete all" button.
     * @private
     */
    private createCartItemsCounter(count: number): HTMLDivElement {
        let cartItemsCount = document.createElement('h3');
        cartItemsCount.textContent = `(${count})`;

        return cartItemsCount;
    };

    /**
     * Creates the total of the shopping cart and a "delete all" button.
     * @returns {HTMLDivElement} The total and "delete all" button.
     * @private
     */
    private createCartTotal(): HTMLDivElement {
        let container = document.createElement('div');
        let currency = this.options.cart?.currency || this.defaultTextColor;
        this.cartTotal = this.createSmallTitle(`Total: ${currency}${this.getTotal()}`);
        this.cartTotal.className += ' sc-cart-total';

        let deleteBtn = this.createScDeleteButton();
        deleteBtn.onclick = this.deleteAllClick;
        deleteBtn.className += ' all';

        let label = document.createElement('p');
        label.textContent = 'All';
        deleteBtn.appendChild(label);

        container.appendChild(this.cartTotal);
        container.appendChild(deleteBtn);

        return container;
    };

    /**
     * Creates the legend of the seatmap.
     * @private
     */
    private createLegend(): void {
        if (this.options.legend) {
            // create legend container
            let legendContainer = this.createContainer('legend', 'column');
            let legendTitle = this.createTitle('Legend');

            let seatsList = this.createLegendList();
            let currency = this.options.cart?.currency || this.defaultCurrency;

            for (let i = 0; i < this.options.types.length; i += 1) {
                let description = `${this.capitalizeFirstLetter(this.options.types[i].type)} ` +
                    currency +
                    this.options.types[i].price.toFixed(2);
                let item = this.createLegendItem(description, '', this.options.types[i].backgroundColor);
                seatsList.appendChild(item);
            }
            seatsList.appendChild(this.createLegendItem('Already booked', 'unavailable'));

            legendContainer.appendChild(legendTitle);
            legendContainer.appendChild(seatsList);
            legendContainer.appendChild(seatsList);

            let legend = document.getElementById(this.options.legend.id);

            if (legend) {
                legend.appendChild(legendContainer);
            }
        }
    };

    /**
     * Creates the shopping cart.
     * @private
     */
    private createCart(): void {
        if (this.options.cart) {
            let cartContainer = this.createContainer('cart', 'column');
            let assetPath = this.options.assets && this.options.assets.path ?
                `${this.options.assets.path}/shoppingcart.svg` :
                '../assets/bin.svg';

            let cartTitle = this.createIconedTitle(
                'Your Cart',
                assetPath,
                'Shopping cart icon.'
            );

            let cartTableContainer = document.createElement('div');
            cartTableContainer.classList.add('sc-cart');
            cartTableContainer.style.width = `${this.options.cart.width}px`;
            cartTableContainer.style.height = `${this.options.cart.height}px`;

            this.cartTable = this.createCartTable();
            cartTableContainer.appendChild(this.cartTable);

            let itemsCount = this.loadCartItems();
            let cartTotal = this.createCartTotal();

            this.cartItemsCounter = this.createCartItemsCounter(itemsCount);
            cartTitle.appendChild(this.cartItemsCounter);

            cartContainer.appendChild(cartTitle);
            cartContainer.appendChild(cartTableContainer);
            cartContainer.appendChild(cartTotal);

            let cart = document.getElementById(this.options.cart.id);
            if (cart) {
                cart.appendChild(cartContainer);
            }
        }
    };

    /**
     * Creates the seatmap.
     * @private
     */
    private createMap(): void {
        let map = document.createElement('div');
        map.classList.add('sc-map');

        let disabled = this.options.map.disabled;
        let disabledRowsCounter = 0;

        let generateName = this.options.map.seatName || this.seatName;

        // add rows containing seats
        for (let i = 0; i < this.options.map.rows; i += 1) {
            let row = this.createRow();

            let isRowDisabled = disabled?.rows ? disabled.rows.indexOf(i) >= 0 : false;
            disabledRowsCounter = isRowDisabled ? disabledRowsCounter + 1 : disabledRowsCounter;

            let disabledColumnsCounter = 0;

            for (let j = 0; j < this.options.map.columns; j += 1) {
                let isColumnDisabled = disabled?.columns ? disabled.columns.indexOf(j) >= 0 : false;
                disabledColumnsCounter = isColumnDisabled ? disabledColumnsCounter + 1 : disabledColumnsCounter;

                let seatTextContent = generateName(
                    { index: i, disabled: isRowDisabled, disabledCount: disabledRowsCounter },
                    { index: j, disabled: isColumnDisabled, disabledCount: disabledColumnsCounter }
                );

                // draw empty row if row is disabled,
                // while draw blank seat if column is disabled
                row.appendChild(this.createSeat('available', seatTextContent, `${i}_${j}`));
            }

            map.appendChild(row);
        }

        let indexes = this.options.map.indexes;
        let front = this.options.map.front;

        let columnContainerDirection = 'column';
        if (indexes?.columns?.position === 'bottom') {
            columnContainerDirection = 'column-reverse';
        }

        let itemsPosition = 'right';
        let rowContainerDirection = 'row';
        if (indexes?.rows?.position === 'right') {
            rowContainerDirection = 'row-reverse';
            itemsPosition = 'left';
        }

        let rowIndexContainer = this.createContainer(null, rowContainerDirection);
        let columnIndexContainer = this.createContainer(null, columnContainerDirection, itemsPosition);
        columnIndexContainer.append(rowIndexContainer);

        // create map container which will contain everything
        let mapContainer = this.createContainer('map', 'column', itemsPosition);

        let frontHeader = this.createFrontHeader();
        if (!front || front.visible === undefined || front.visible) {
            frontHeader.classList.add('sc-margin-bottom');
            mapContainer.appendChild(frontHeader);
        }

        if (!indexes || !indexes.columns || indexes.columns.visible === undefined || indexes.columns.visible) {
            columnIndexContainer.appendChild(this.createColumnIndex());
        }

        if (!indexes || !indexes.rows || indexes.rows.visible === undefined || indexes.rows.visible) {
            rowIndexContainer.appendChild(this.createRowIndex());
        }

        rowIndexContainer.append(map);
        columnIndexContainer.append(rowIndexContainer);
        mapContainer.append(columnIndexContainer);

        let seatmap = document.getElementById(this.options.map.id);
        if (seatmap) {
            seatmap.appendChild(mapContainer);
        }

        let seat = <HTMLElement> document.getElementsByClassName('sc-seat')[0];
        let width = seat.offsetWidth;

        let computedStyle = this.getStyle(seat);
        let margins = parseInt(computedStyle.marginLeft, 10) +
            parseInt(computedStyle.marginRight, 10);

        let mapWidth = (width + margins) * this.options.map.columns;

        // set front header and map width
        map.style.width = `${mapWidth}px`;

        if (!front || front.visible === undefined || front.visible) {
            frontHeader.style.width = `${mapWidth}px`;
        }

        this.addDisabledSeatsToOptions();
        this.disableAndReserveSeats();
        this.selectSeats();
    };
}

export default Seatchart;
