// export const state = () => ({
//     loggedIn: false,
//     userName: null,
//     email: null
// })

// export const getters = {
//     loggedInStatus(state) {
//         return state.loggedIn;
//     },
// }

// export const mutations = {
//     setLoggedInStatus(state, payload) {
//         state.loggedIn = payload
//     },
//     setUserNameStatus(state, payload) {
//         state.userName = payload
//     },
//     setEmailStatus(state, payload) {
//         state.email = payload
//     },
// }

// // nuxtServerInitはstore/index.jsにしか記述できない
// export const actions = {
//     async nuxtServerInit({ commit }, { app }) {
//         await commit('setLoggedInStatus', app.session.loggedIn);
//         await commit('setUserNameStatus', app.session.user);
//         await commit('setEmailStatus', app.session.email);
//     }
// }
