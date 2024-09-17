
export function getHomePage(c, center) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/visa/gb/${center}/home`
        case "ch":
            return `https://visas-ch.tlscontact.com/visa/gb/${center}/home`
        default:
            console.log("Unexpected country: ", c)
            return ""
    }
}

export function cfHopRq(c) {
    switch (c) {
        case "be":
            return "https://auth.visas-be.tlscontact.com/auth/resources/17dei/login/web/img/favicon.ico"
        case "ch":
            return "https://auth.visas-ch.tlscontact.com/auth/resources/153om/login/web/img/tls-logo.svg"
        default:
            console.log("Unexpected country: ", c)
            return ""
    }
}

export function apPage(c) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/appointment/gb/`
        case "ch":
            return `https://visas-ch.tlscontact.com/appointment/gb/`
        default:
            console.log("Unexpected country: ", c)
            return ""
    }
}

export function tableC1(c, center, fid) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=be&formGroupId=${fid}&appointmentType=normal&appointmentStage=appointment`
        case "ch":
            return `https://visas-ch.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=ch&formGroupId=${fid}&appointmentType=normal&appointmentStage=appointment`
        default:
            console.log("Unexpected country ", c);
            return "";
    }
}
