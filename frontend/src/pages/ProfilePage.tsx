import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user.types";
import { getUserProfile } from "../api/user.api";

function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getUserProfile();
                setUser(profile);
            } catch (err: any) {
                console.error("Error fetching profile:", err);
                setError(err.response?.data?.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p style={{ color: "red" }}>{error}</p>
                <button onClick={handleLogout}>Go to Login</button>
            </div>
        );
    }

    if (!user) {
        return <div>No user data available</div>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default ProfilePage;

