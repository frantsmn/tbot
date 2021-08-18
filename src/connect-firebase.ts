import admin from 'firebase-admin'

export default FIREBASE_ACCOUNT => {
    admin.initializeApp({
        credential: admin.credential.cert(FIREBASE_ACCOUNT),
        databaseURL: "https://frog-back.firebaseio.com"
    })
    return admin.firestore()
}