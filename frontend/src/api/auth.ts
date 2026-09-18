import { axiosClient } from "./axiosClient"

export const login = async()=> {
    const response = await axiosClient.post("/auth/login");
    return response.data;

}


