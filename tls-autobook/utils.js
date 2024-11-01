export function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
