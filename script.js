const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '×' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
  }));
}

// Currency display: illustrative conversion for concept-stage prices, not a live FX feed.
(() => {
  const EUR_TO_USD = 1.10;
  const header = document.querySelector('.site-header');
  if (!header) return;

  let currency = 'EUR';
  try {
    currency = localStorage.getItem('brescia-currency') === 'USD' ? 'USD' : 'EUR';
  } catch (_) {}

  const currencyButton = document.createElement('button');
  currencyButton.type = 'button';
  currencyButton.className = 'currency-toggle';
  currencyButton.setAttribute('aria-label', 'Switch displayed prices to US dollars');
  currencyButton.title = 'USD prices are approximate conversions at €1 = $1.10, not live exchange rates.';
  currencyButton.addEventListener('click', () => {
    currency = currency === 'EUR' ? 'USD' : 'EUR';
    try { localStorage.setItem('brescia-currency', currency); } catch (_) {}
    renderPrices();
  });
  header.appendChild(currencyButton);

  const priceElements = [...document.querySelectorAll('.product-meta strong, .pricing-start strong')];
  const prices = priceElements.map(element => {
    const original = element.textContent.trim();
    const match = original.match(/^(.*?)(€)\s*(\d+(?:\.\d{1,2})?)\s*$/);
    if (!match) return null;
    return { element, original, prefix: match[1], euros: Number(match[3]) };
  }).filter(Boolean);

  function renderPrices() {
    currencyButton.textContent = currency === 'EUR' ? 'USD $' : 'EUR €';
    currencyButton.setAttribute('aria-label', currency === 'EUR' ? 'Switch displayed prices to US dollars' : 'Switch displayed prices to euros');
    prices.forEach(price => {
      if (currency === 'EUR') {
        price.element.textContent = price.original;
      } else {
        const converted = price.euros * EUR_TO_USD;
        const wholeDollars = Math.floor(converted);
        // Keep the leading dollar digits, set the final dollar digit to 9, and use .99 cents.
        const marketPrice = Math.floor(wholeDollars / 10) * 10 + 9;
        const amount = new Intl.NumberFormat('en-US', {
          style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
        }).format(marketPrice + 0.99);
        price.element.textContent = price.prefix + amount;
      }
    });
  }
  renderPrices();
})();
