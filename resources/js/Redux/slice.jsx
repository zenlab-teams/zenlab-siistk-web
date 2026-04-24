import { createSlice } from "@reduxjs/toolkit";

const authSession = sessionStorage.getItem('auth');
const authLocal = localStorage.getItem('auth');
const darkModeSession = sessionStorage.getItem('darkMode');
const initialStateAuth =  authLocal ? JSON.parse(authLocal) : authSession ? JSON.parse(authSession) : { user: null, isAdmin: null };
const initialStateDarkMode = darkModeSession ? JSON.parse(darkModeSession) : false;

const authSlice = createSlice({
    name: 'auth',
    initialState: initialStateAuth,
    reducers: {
        setUser: (state, action) => {
            const { user, isAdmin, remember } = action.payload;
            state.user = user;
            state.isAdmin = isAdmin;
            state.remember = remember;
            if (remember) {
                localStorage.setItem('auth', JSON.stringify({ user, isAdmin }));
            } else {
                sessionStorage.setItem('auth', JSON.stringify({ user, isAdmin }))
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAdmin = null;
            if (state.remember) {
                localStorage.removeItem('auth');
            } else {
                sessionStorage.removeItem('auth');
            }
            state.remember = null;
        }
    }
});

const currentRouteSlice = createSlice({
    name: 'currentRoute',
    initialState: { route: null, subRoute: null },
    reducers: {
        setCurrentRoute: (state, action) => {
            return action.payload;
        }
    }
});

const darkModeSlice = createSlice({
    name: 'darkMode',
    initialState: initialStateDarkMode,
    reducers: {
        setDarkMode: (state, action) => {
            sessionStorage.setItem('darkMode', JSON.stringify(action.payload));
            return action.payload;
        }
    }
});

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState: false,
    reducers: {
        toggleSidebar: (state) => !state,
        setSidebar: (_, action) => action.payload,
    }
});

export const { setUser, logout } = authSlice.actions;
export const { setCurrentRoute } = currentRouteSlice.actions;
export const { setDarkMode } = darkModeSlice.actions;
export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export const authReducer = authSlice.reducer;
export const currentRouteReducer = currentRouteSlice.reducer;
export const darkModeReducer = darkModeSlice.reducer;
export const sidebarReducer = sidebarSlice.reducer;

export const rootReducer = {
    auth: authReducer,
    currentRoute: currentRouteReducer,
    darkMode: darkModeReducer,
    sidebar: sidebarReducer,
};