import firebase from '@/plugins/firebase';
import axios from 'axios'

export const state = () => ({
    loggedIn: false,
    user: null,
    email: null
})

export const getters = {
    user(state) {
        return state.user;
    },
    loggedIn(state) {
        return state.loggedIn;
    },
    email(state) {
        return state.email;
    }
}

export const mutations = {
    setIsLoggedIn(state, payload) {
        state.loggedIn = payload
    },
    setUser(state, payload) {
        state.user = payload
    },
    setEmail(state, payload) {
        state.email = payload
    },
}

export const actions = {
    async googleLogin({ commit }, payload) {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const { user } = await firebase.auth().signInWithPopup(provider);
            if (user.uid !== "rkrT1wQy8qYeKuXuWOi7NeyIyqD2") { throw new Error('You are not allowed to logIn.')}
            
            await commit('setIsLoggedIn', true);
            await commit('setUser', user.displayName);
            await commit('setEmail', user.email);
            await this.$axios.$post("/mng/login", { loggedIn: true, user: user.displayName, email: user.email })
                .then((res) => { console.log("authentication.js then ===", res); })
                .catch((err) => { console.log(err) });
            return;
        } catch (err) {
            console.log("google login err ", err);
        }
    },
}
