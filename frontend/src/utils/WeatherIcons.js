export function getWeatherIcons(code) {
    if (code === 0) return 'src/assets/sun.png';
    if (code === 3 || code === 45 || code === 48) return 'src/assets/clouds.png';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'src/assets/rain.png';
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'src/assets/snow.png';
    else return 'src/assets/sun.png';
}