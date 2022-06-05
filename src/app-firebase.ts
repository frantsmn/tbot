// import Logger from './modules/logger/logger';
//
// const logger = new Logger('app-firebase');
//
// export default class AppFirebase {
//     FIREBASE: FirebaseFirestore.Firestore;
//
//     constructor(FIREBASE: FirebaseFirestore.Firestore) {
//         this.FIREBASE = FIREBASE;
//     }
//
//     async getUserByUserId(userId) {
//         logger.log({
//             value: `Получение аккаунтa пользователя ${userId} из firebase`,
//             type: 'info',
//         });
//         const user = await this.FIREBASE.doc(`users/${userId}`).get();
//         return user.data();
//     }
//
//     async setUser(user) {
//         logger.log({
//             value: `Добавление аккаунтa пользователя ${user.id} в firebase`,
//             type: 'info',
//         });
//         await this.FIREBASE.doc(`users/${user.id}`).set(user, { merge: true });
//     }
// }
