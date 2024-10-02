/**
 * @param {string} country
 * @param {string} center
 */
export function getHomePage(country, center) {
    switch (country) {
        case "ch":
            return `https://visas-ch.tlscontact.com/visa/gb/${center}/home`;
    }
}


export function cfHopRq(c) {
    switch (c) {
        case "be":
            return "https://auth.visas-be.tlscontact.com/auth/resources/17dei/login/web/img/favicon.ico"
        case "ch":
            return "https://auth.visas-ch.tlscontact.com/auth/resources/153om/login/web/img/tls-logo.svg"
        case "de":
            return "https://auth.visas-de.tlscontact.com/auth/resources/huxh1/login/web/img/tls-logo.svg"
        case "fr":
            return "https://i2-auth.visas-fr.tlscontact.com/auth/resources/kozhl/login/web/img/tls-logo.svg"
        default:
            console.log("Unexpected country: ", c)
            return ""
    }
}

export function cfHopRq2(c) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/`
        case "ch":
            return `https://visas-ch.tlscontact.com/`
        case "de":
            return `https://visas-de.tlscontact.com/`
        case "fr":
            return `https://fr.tlscontact.com/`
        default:
            console.log("Unexpected country: ", c)
            return ""
    }
}

