import firebase from 'firebase'

if (!firebase.apps.length) {
    firebase.initializeApp(
        {
            apiKey: "AIzaSyC84tS4zOk7fkSFp9Umlln1RJnWsv4wyA4",
            authDomain: "teck-blog-at-nuxt.firebaseapp.com",
            databaseURL: "https://teck-blog-at-nuxt.firebaseio.com",
            projectId: "teck-blog-at-nuxt",
            storageBucket: "teck-blog-at-nuxt.appspot.com",
            messagingSenderId: "425640714535",
            appId: "1:425640714535:web:c3c127d08f2b6d7df28902",
            measurementId: "G-63KPS0BDH4"
        }
    )
}

export default firebase;