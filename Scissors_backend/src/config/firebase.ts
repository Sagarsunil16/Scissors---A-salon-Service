import admin from 'firebase-admin'
import serviceAccount from '../secureDocs/serviceAccount.json'
if(!admin.apps.length){
    admin.initializeApp({
        credential:admin.credential.cert(serviceAccount as admin.ServiceAccount) // Use service account for production
    })
}
export default admin