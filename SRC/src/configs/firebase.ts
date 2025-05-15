import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDTmx6xLVSDEYooC3IIx25nO4SyQbiT3HM",
    authDomain: "uploadingfile-4ee57.firebaseapp.com",
    projectId: "uploadingfile-4ee57",
    storageBucket: "uploadingfile-4ee57.appspot.com",
    messagingSenderId: "888048171111",
    appId: "1:888048171111:web:cd1a04056c522eaeeefcc2"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
