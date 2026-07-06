const formatStatusLabel = (value) => value
    ?.split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || '-';

module.exports = formatStatusLabel;
