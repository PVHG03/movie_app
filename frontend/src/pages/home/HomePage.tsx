import { useAuthStore } from "../../store/authUser";
import AuthScreen from "./AuthSrcreen";
import HomeScreen from "./HomeScreen";

const HomePage = () => {
	const { user } = useAuthStore() as any;

	return <>{user ? <HomeScreen /> : <AuthScreen />}</>;
};
export default HomePage;