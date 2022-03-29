function currencyFormatter(currency, sign) {
    if (typeof currency == 'undefined') {
        return sign
    }
    currency = Number(currency);
    var sansDec = currency.toFixed(2);
    var formatted = sansDec.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + `${formatted}`;
}

export { currencyFormatter }