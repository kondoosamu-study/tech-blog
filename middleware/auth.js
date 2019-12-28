export default function ({ store, redirect, req }) {
    if (process.server) {
        if (!req.session.loggedIn) {
            redirect('/mng/login');
        } else {
            store.commit('authentication/setIsLoggedIn', req.session.loggedIn)
            store.commit('authentication/setUser', req.session.user)
            store.commit('authentication/setEmail', req.session.email)
        }
    } else {
        // client side
        if (!store.state.authentication.loggedIn) {
            redirect('/mng/login');
        } 
    }
    
}