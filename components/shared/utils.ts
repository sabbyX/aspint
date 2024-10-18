export function getCountryFlag(c: string) {
    switch (c.toLowerCase()) {
        case "switzerland":
        case "ch":
            return "🇨🇭"
        case "belgium":
        case "be":
            return "🇧🇪"
        case "france":
        case "fr":
            return "🇫🇷"
        case "germany":
        case "de":
            return "🇩🇪"
        default:
            return "⭕"
    }
}

export function getCountryFromISOCode(c: string) {
    switch (c) {
        case "ch":
            return "Switzerland"
        case "be":
            return "Belgium"
        case "fr":
            return "France"
        case "de":
            return "Germany"
        default:
            return "unknown"
    }
}
