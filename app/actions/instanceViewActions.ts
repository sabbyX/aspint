
export interface IInstanceViewData {
    ABCountry: string,
    state: "running" | "inactive" | "error"
    ABData: IInstanceQData[] | undefined
}

interface IInstanceQData {
    nameIdentifier: string,
    formID: number,
    center: string,
    statusVerbose: string,
    status: "running"|"inactive"|"error",
}


