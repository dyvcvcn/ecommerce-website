/**
 * SANDBOX / TEST-MODE payment gateway.
 *
 * This mimics how Stripe/Razorpay test mode works so the whole checkout flow
 * runs end-to-end with zero external accounts or API keys:
 *   - Card number ending in 0002 (or containing "0000000000000002")  -> declined
 *   - Any other syntactically valid test card                       -> approved
 * No real card data is transmitted or stored anywhere.
 *
 * To swap in REAL Stripe test-mode: install `stripe`, set STRIPE_SECRET_KEY
 * in .env, and replace the body of chargeCard() with a call to
 * stripe.paymentIntents.create(...) / confirm(...). The rest of the app
 * (routes, DB writes, order status) does not need to change.
 */
const { v4: uuid } = require('uuid');

const DECLINE_SUFFIXES = ['0002', '0341', '9995'];

function luhnCheck(num) {
    const digits = num.replace(/\D/g, '');
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        alt = !alt;
    }
    return digits.length >= 12 && sum % 10 === 0;
}

function chargeCard({ cardNumber, expiry, cvc, amount }) {
    const digits = (cardNumber || '').replace(/\D/g, '');

    if (!digits || !expiry || !cvc) {
        return { success: false, error: 'Missing card details' };
    }
    if (!luhnCheck(digits)) {
        return { success: false, error: 'Card number failed validation (use a test card, e.g. 4242 4242 4242 4242)' };
    }
    if (!/^\d{3,4}$/.test(cvc)) {
        return { success: false, error: 'Invalid CVC' };
    }
    const [mm, yy] = expiry.split('/').map(s => (s || '').trim());
    if (!mm || !yy || Number(mm) < 1 || Number(mm) > 12) {
        return { success: false, error: 'Invalid expiry date' };
    }

    const last4 = digits.slice(-4);
    if (DECLINE_SUFFIXES.includes(last4)) {
        return { success: false, error: 'Card declined by issuer (test decline)', paymentId: null };
    }

    return {
        success: true,
        paymentId: 'pay_' + uuid().replace(/-/g, '').slice(0, 20),
        amount,
        status: 'succeeded',
        mode: 'sandbox',
    };
}

module.exports = { chargeCard };