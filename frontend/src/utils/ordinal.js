export function getOrdinal(n) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = n % 100;
    const suffix = suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
    return `${n}${suffix}`;
}