import Base from 'components/Base';
import LegendItem from 'components/legend/LegendItem';
import Store from 'store';
import { DEFAULT_CURRENCY } from 'consts';

class Legend extends Base<HTMLUListElement> {
  public constructor(store: Store) {
    const { cart, map, reservedLegendLabel, hideLegendPrice } = store.getOptions();
    const list = document.createElement('ul');
    list.className = 'sc-legend';

    const currency = cart?.currency || DEFAULT_CURRENCY;
    const seatTypesOptions = map.seatTypes;

    const types = Object.keys(seatTypesOptions);
    types.sort((a, b) => seatTypesOptions[b].price - seatTypesOptions[a].price);

    for (const type of types) {
      const seatType = seatTypesOptions[type];
      const currencyLocation = cart?.currencyBehind 
        ? `${seatType.price}${currency}`
        : `${currency}${seatType.price}`;
      const description = hideLegendPrice 
        ? `${seatType.label}`
        : `${seatType.label} (${currencyLocation})`;
      const item = new LegendItem(description, seatType.cssClass);
      list.appendChild(item.element);
    }

    const reservedItem = new LegendItem(reservedLegendLabel ?? 'Reserved', 'sc-seat-reserved');
    list.appendChild(reservedItem.element);

    super(list);
  }
}

export default Legend;
