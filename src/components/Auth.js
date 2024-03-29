import { auth, googleAuthProvider } from "../config/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { useState } from "react";
import { db, instancesRef } from "../config/firebase";
import { getDocs, collection, query, where, addDoc, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import Button from "@mui/material/Button";
import { useSelector, useDispatch } from "react-redux";
// import { resetState } from "../redux/reducers/config";

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    console.log(auth?.currentUser?.email);

    const signIn = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleAuthProvider);
            const user = result.user;
            console.log("Auth User:", user);

            // Check if the user already exists in the "users" collection
            const usersCollection = collection(db, "users");
            const instancesCollection = collection(db, "instances");
            const userQuery = query(usersCollection, where("email", "==", user.email));
            const querySnapshot = await getDocs(userQuery);
            if (querySnapshot.empty) {
                // If the query snapshot is empty, it means the user doesn't exist in the "users" collection

                // Add a new document with the user's email
                const newUserDoc = {
                    creationDate: new Date().getTime(),
                    email: user.email,
                    authId: user.uid,
                    // You can add more fields as needed
                };

                const newInstanceDoc = doc(instancesCollection, user.uid);
                const newInstanceData = {
                    creationDate: new Date().getTime(),
                    email: user.email,
                    // You can add more fields as needed
                };

                await addDoc(usersCollection, newUserDoc);
                await setDoc(newInstanceDoc, newInstanceData);

                console.log("New user document added to Firestore.");
            } else {
                console.log("User already exists in Firestore.");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            {/* <input
        placeholder="Email..."
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      /> */}
            {/* <button onClick={signIn}>Sign In</button> */}
            <Button onClick={signInWithGoogle} fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }}>
                <svg aria-hidden="true" class="native svg-icon iconGoogle" width="18" height="18" viewBox="0 0 18 18">
                    <path
                        fill="#4285F4"
                        d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"
                    ></path>
                    <path
                        fill="#34A853"
                        d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"
                    ></path>
                    <path
                        fill="#FBBC05"
                        d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"
                    ></path>
                    <path
                        fill="#EA4335"
                        d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"
                    ></path>
                </svg>
                <p> </p>
                Sign In with Google
            </Button>
            {/* <button onClick={logout}>Logout</button> */}
        </div>
    );
};
