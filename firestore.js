const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://frog-back.firebaseio.com"
});
// As an admin, the app has access to read and write all data, regardless of Security Rules
const firestore = admin.firestore();


exports.getUserByUserId = async (id) => {
    const user = await firestore.doc(`users/${id}`).get();
    return user.data();
}

exports.getAllUsers = async () => {
    let users = [];
    const collection = await firestore.collection('users').get();
    collection.forEach(user => users.push(user.data()));
    return users;
}

exports.setUser = async (user) => {
    await firestore.doc(`users/${user.id}`).set(user, { merge: true });
}


exports.getBeltelecomAccountsByUserId = async (id) => {
    let accounts = await firestore.collection('beltelecom').where('users', 'array-contains', id).get();
    let res = [];
    accounts.forEach(account => res.push(account.data()));
    return res;
}

exports.getAllBeltelecomAccounts = async () => {
    let accounts = [];
    const collection = await firestore.collection('beltelecom').get();
    collection.forEach(doc => accounts.push(doc.data()));
    return accounts;
}

exports.setAllBeltelecomAccounts = async (data) => {
    for (const account of data) {
        await firestore.doc(`beltelecom/${account.login}`).set(account);
    }
}


exports.getMtsAccountsByUserId = async (id) => {
    let accounts = await firestore.collection('mts').where('users', 'array-contains', id).get();
    let res = [];
    accounts.forEach(account => res.push(account.data()));
    return res;
}

exports.getAllMtsAccounts = async () => {
    let accounts = [];
    const collection = await firestore.collection('mts').get();
    collection.forEach(doc => accounts.push(doc.data()));
    return accounts;
}

exports.getUrgentMtsAccounts = async () => {
    let accounts = [];
    const collection = await firestore.collection('mts').get();

    collection.forEach(doc => {
        if (doc.data().needUpdate)
            accounts.push(doc.data())
    });

    return accounts;
}

exports.setMtsAccounts = async (data) => {
    for (const account of data) {
        await firestore.doc(`mts/${account.login}`).set(account);
    }
}