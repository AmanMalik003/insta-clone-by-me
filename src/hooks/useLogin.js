import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import useShowToast from "./useShowToast";
import { auth, firestore } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

const useLogin = () => {
	const showToast = useShowToast();
	const [signInWithEmailAndPassword, , loading, error] = useSignInWithEmailAndPassword(auth);
	const loginUser = useAuthStore((state) => state.login);

	const login = async (inputs) => {
		// Validate email format
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!inputs.email || !emailPattern.test(inputs.email)) {
			showToast("Error", "Please enter a valid email address", "error");
			return;
		}
	
		if (!inputs.password) {
			showToast("Error", "Please fill in the password field", "error");
			return;
		}
	
		if (!inputs.fullName || !inputs.username) {
			showToast("Error", "Please fill in all the fields", "error");
			return;
		}
	
		try {
			const userCred = await signInWithEmailAndPassword(inputs.email, inputs.password);
	
			if (userCred) {
				const docRef = doc(firestore, "users", userCred.user.uid);
				const docSnap = await getDoc(docRef);
				localStorage.setItem("user-info", JSON.stringify(docSnap.data()));
				loginUser(docSnap.data());
			}
		} catch (error) {
			if (error.code === "auth/invalid-email") {
				showToast("Error", "Invalid email address. Please provide a valid email address.", "error");
			} else {
				showToast("Error", "Login failed. Please try again.", "error");
			}
		}
	};

	return { loading, error, login };
};

export default useLogin;