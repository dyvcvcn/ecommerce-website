const BASE_URL = '/api';

function authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers || {}),
        },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

export const api = {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    getProducts: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getCategories: () => request('/products/categories'),
    getProduct: (id) => request(`/products/${id}`),

    getCart: () => request('/cart'),
    addToCart: (productId, quantity = 1) =>
        request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    updateCartItem: (cartItemId, quantity) =>
        request(`/cart/${cartItemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    removeCartItem: (cartItemId) => request(`/cart/${cartItemId}`, { method: 'DELETE' }),

    getOrders: () => request('/orders'),
    getOrder: (id) => request(`/orders/${id}`),
    checkout: (body) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
};