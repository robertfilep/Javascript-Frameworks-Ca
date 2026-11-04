# ShopSphere

A responsive portfolio storefront by Robert Filep, built with React and the Noroff Online Shop API. Browse products, search by name, description or tags, explore customer reviews and try a demo checkout.

## Features

- Product catalog with search, price/rating/discount sorting and incremental display.
- Product details, original and discounted prices, API-provided reviews and local image fallbacks.
- Shared cart state with immediate header updates, validated quantities and local persistence.
- Totals calculated in integer cents to avoid floating-point rounding errors.
- Demo checkout with a receipt that remains available when the confirmation page is refreshed.
- Responsive desktop and mobile navigation, keyboard focus styles and reduced-motion support.
- Contact form with accessible validation and clear demo feedback.
- Loading, error, retry, empty and not-found states.

## Demo behavior

This is a portfolio project. Checkout does not collect card details, take payments, create an order on a server or arrange delivery. Receipts contain only product information and are stored in the current browser session. The contact form validates input but does not deliver messages. Reviews are read from the product API; the app does not publish new reviews.

The cart is saved in localStorage under `cart`. If browser storage is unavailable, it remains usable in memory for the current tab. No authentication is required.

## Technologies

React 18, React Router 7, CSS, the Fetch API, localStorage and sessionStorage. Tests use Jest and React Testing Library through react-scripts.

Product data: https://v2.api.noroff.dev/online-shop

## Local development

Use Node.js 20 or newer, as required by React Router 7.

```sh
npm ci
npm start
```

The development server normally opens at http://localhost:3000. To use another port on macOS or Linux:

```sh
PORT=3001 npm start
```

## Validation

```sh
CI=true npm test -- --watchAll=false --runInBand
npm run build
```

Tests cover pricing, corrupted cart recovery, duplicate products, quantity limits, cart synchronization, demo checkout, receipt recovery, catalog pagination, search and sorting, API errors and retries, navigation and contact validation.

The Jest module mappings in package.json point to the CommonJS builds shipped by React Router 7 so the existing react-scripts test runner can resolve its package exports.

## Deployment

The production files are generated in `build`. The included Netlify configuration builds the app and routes direct requests for product, cart and other application pages back to index.html.

## Main files

- `src/shop.js`: API access, pricing, catalog pagination and cart normalization.
- `src/CartContext.jsx`: shared cart state and persistence.
- `src/components`: navigation, layout, images and price display.
- `src/pages`: catalog, product, cart, confirmation and contact screens.
- `src/tests`: behavior and regression tests.

Created by Robert Filep.
