
export function getHomePage(c, center) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/visa/gb/${center}/home`
        case "ch":
            return `https://visas-ch.tlscontact.com/visa/gb/${center}/home`
        case "de":
            return `https://visas-de.tlscontact.com/visa/gb/${center}/home`
        case "fr":
            return `https://fr.tlscontact.com/visa/gb/${center}/home`
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

export function apPage(c) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/appointment/gb/`
        case "ch":
            return `https://visas-ch.tlscontact.com/appointment/gb/`
        case "de":
            return `https://visas-de.tlscontact.com/appointment/gb/`
        case "fr":
            return `https://fr.tlscontact.com/appointment/gb/`
            
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
        case "de":
            return `https://visas-de.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=de&formGroupId=${fid}&appointmentType=normal&appointmentStage=appointment`
        case "fr":
            return `https://fr.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=fr&formGroupId=${fid}&appointmentType=normal&appointmentStage=appointment`
        default:
            console.log("Unexpected country ", c);
            return "";
    }
}

export function tableC2(c, center, fid) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=be&formGroupId=${fid}&appointmentType=prime%20time&appointmentStage=appointment`
        case "ch":
            return `https://visas-ch.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=ch&formGroupId=${fid}&appointmentType=prime%20time&appointmentStage=appointment`
        case "de":
            return `https://visas-de.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=de&formGroupId=${fid}&appointmentType=prime%20time&appointmentStage=appointment`
        case "fr":
            return `https://fr.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=fr&formGroupId=${fid}&appointmentType=prime%20time&appointmentStage=appointment`
        default:
            console.log("Unexpected country ", c);
            return "";
    }
}

export function tableC3(c, center, fid) {
    switch (c) {
        case "be":
            return `https://visas-be.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=be&formGroupId=${fid}&appointmentType=prime%20time%20weekend&appointmentStage=appointment`
        case "ch":
            return `https://visas-ch.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=ch&formGroupId=${fid}&appointmentType=prime%20time%20weekend&appointmentStage=appointment`
        case "de":
            return `https://visas-de.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=de&formGroupId=${fid}&appointmentType=prime%20time%20weekend&appointmentStage=appointment`
        case "fr":
            return `https://fr.tlscontact.com/services/customerservice/api/tls/appointment/gb/${center}/table?client=fr&formGroupId=${fid}&appointmentType=prime%20time%20weekend&appointmentStage=appointment`
        default:
            console.log("Unexpected country ", c);
            return "";
    }
}
