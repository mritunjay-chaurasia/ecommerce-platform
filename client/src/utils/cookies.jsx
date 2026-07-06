const DEFAULT_OPTIONS = {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'Lax',
};

const isProduction = process.env.NODE_ENV === 'production';

export const getCookie = (name) => {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name, value, options = {}) => {
    if (typeof document === 'undefined') {
        return;
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.maxAge !== undefined) {
        cookie += `; Max-Age=${opts.maxAge}`;
    }

    if (opts.path) {
        cookie += `; Path=${opts.path}`;
    }

    if (opts.sameSite) {
        cookie += `; SameSite=${opts.sameSite}`;
    }

    if (opts.secure || isProduction) {
        cookie += '; Secure';
    }

    document.cookie = cookie;
};

export const removeCookie = (name, options = {}) => {
    setCookie(name, '', { ...options, maxAge: 0 });
};
