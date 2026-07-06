const parseExpiry = (value) => {
    if (!value) {
        return 7 * 24 * 60 * 60 * 1000;
    }

    if (typeof value === 'number') {
        return value;
    }

    const match = String(value).match(/^(\d+)([dhms])$/i);

    if (!match) {
        return 7 * 24 * 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = {
        d: 24 * 60 * 60 * 1000,
        h: 60 * 60 * 1000,
        m: 60 * 1000,
        s: 1000,
    };

    return amount * multipliers[unit];
};

module.exports = parseExpiry;
