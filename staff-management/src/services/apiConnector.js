import axios from 'axios'

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, hearders, params)=>{
    // console.log(bodyData)
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData? bodyData:null,
        headers: hearders? hearders:null,
        params: params? params:null
    })
}