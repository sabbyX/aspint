import { createSlice } from "@reduxjs/toolkit";

const rootSlice = createSlice({
    name: "root",

    initialState: {
        AuthStage: 1,
        AuthUsername: "",
        AuthPassword: "",

        AuthCode: "",
        InvalidCredentialAlert: false
    },

    reducers: {
        authStage: (state, action) => { state.AuthStage = action.payload },
        authUsername: (state, action) => { state.AuthUsername = action.payload },
        authPassword: (state, action) => { state.AuthPassword = action.payload },
        authCode: (state, action) => { state.AuthCode = action.payload },
        invalidCredentialAlert: (state, action) => { state.InvalidCredentialAlert = action.payload },
    }
})


export const { authStage, authUsername, authPassword, authCode, invalidCredentialAlert } = rootSlice.actions;
export const reducer = rootSlice.reducer;
