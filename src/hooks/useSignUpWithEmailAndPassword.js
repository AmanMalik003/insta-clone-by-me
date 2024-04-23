import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, firestore } from "../firebase/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";

const useSignUpWithEmailAndPassword = () => {
    const [createUserWithEmailAndPassword, , loading, error] = useCreateUserWithEmailAndPassword(auth);
    const showToast = useShowToast();
    const loginUser = useAuthStore((state) => state.login);

    const signup = async (inputs) => {
		if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}
	
		const usersRef = collection(firestore, "users");
	
		const q = query(usersRef, where("username", "==", inputs.username));
		const querySnapshot = await getDocs(q);
	
		if (!querySnapshot.empty) {
			showToast("Error", "Username already exists", "error");
			return;
		}
	
		try {
			const newUserCredential = await createUserWithEmailAndPassword(inputs.email, inputs.password);
	
			if (!newUserCredential || !newUserCredential.user) {
				// Handle case where user credential is undefined
				showToast("Error", "You have entered something wrong.", "error");
				return;
			}
	
			const newUser = newUserCredential.user;
	
			const userDoc = {
				uid: newUser.uid,
				email: inputs.email,
				username: inputs.username,
				fullName: inputs.fullName,
				bio: "",
				profilePicURL: "",
				followers: [],
				following: [],
				posts: [],
				createdAt: Date.now(),
			};
	
			await setDoc(doc(firestore, "users", newUser.uid), userDoc);
			localStorage.setItem("user-info", JSON.stringify(userDoc));
			loginUser(userDoc);
		} catch (error) {
			if (error.code === "auth/invalid-email") {
				showToast("Error", "Invalid email address. Please provide a valid email address.", "error");
			} else {
				showToast("Error", error.message, "error");
			}
		}
	};

    return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;