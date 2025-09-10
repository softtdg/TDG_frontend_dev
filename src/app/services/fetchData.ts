import { AxiosInstance } from "./axiosInterface"

export async function GetData(sopNumber: string) {
    // try {
    const response = await AxiosInstance.get(`/sopSearch/SOPSerchService?SOPNumber=${sopNumber}`);
    return response;
    // } catch (error: any) {
    //     console.error('API Error:', error.response?.status, error.response?.data);
    //     throw error;
    // }
}

export async function GetFixtureDetails(fixtureNumber: string, user: string = "om") {
    const response = await AxiosInstance.get(`/sopSearch/fixtureDetails?fixtureNumber=${fixtureNumber}&user=${user}`)
    return response
}

export async function getPickListDataBySop(lhrEntryId: string, user: string = "om") {
    const response = await AxiosInstance.get(`/sopSearch/getPickListData?user=${user}&lhrEntryId=${lhrEntryId}`)
    return response
}

export async function getBlankPickListData(fixtureNumber: string, user: string = "om") {
    const response = await AxiosInstance.get(`/sopSearch/getPickListData?user=${user}&fixture=${fixtureNumber}`)
    return response
}

export async function DownloadUpdatedData(payload: any) {
    const response = await AxiosInstance.post(`/sopSearch/downloadupdatedDataSheets`, payload, {
        responseType: 'blob'
    })
    return response
}

export async function LoginDeatils(data:any) {
    const response = await AxiosInstance.post('/auth/login',data)
    return response
}