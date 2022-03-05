import Base from 'components/Base';
import Store from 'store';
import { DEFAULT_CURRENCY } from 'consts';

class CartTotal extends Base<HTMLDivElement> {
  private store: Store;

  public constructor(store: Store) {
    const total = document.createElement('p');
    total.className = 'sc-cart-total';

    super(total);

    this.store = store;
    this.eventListener = this.eventListener.bind(this);

    this.store.addEventListener('cartchange', this.eventListener);
    this.store.addEventListener('cartclear', this.eventListener);
    this.store.addEventListener('seatchange', this.eventListener);
  }

  private eventListener() {
    const { cart } = this.store.getOptions();
    const currency = cart?.currency || DEFAULT_CURRENCY;
    const total = this.store.getCartTotal();

    this.element.textContent = `Total: ${currency}${total.toFixed(2)}`;
  }
}

export default CartTotal;
