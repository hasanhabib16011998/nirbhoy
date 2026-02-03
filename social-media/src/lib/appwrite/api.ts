import { type INewUser, type ISignInUser } from "@/types";

export async function createUserAccount(user: INewUser) {
    try {
      const response = await fetch("http://127.0.0.1:8000/users/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // If Django returns 400 or 500, we throw an error with the message
        throw new Error(JSON.stringify(data));
      }
  
      return data;
    } catch (error) {
      console.log("API Error:", error);
      throw error; // Re-throw so the UI can catch it
    }
  }

  export async function signInAccount(user: ISignInUser) {
    try {
      const response = await fetch("http://127.0.0.1:8000/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Handle 401 Unauthorized or other errors
        throw new Error(data.error || "Login failed");
      }
  
      return data;
    } catch (error) {
      console.log("Login API Error:", error);
      throw error;
    }
  }

  export async function getCurrentUser() {
    try {
      // 1. Retrieve the token from LocalStorage
      const token = localStorage.getItem("accessToken");
  
      if (!token) return null; // No token = No user
  
      // 2. Call the Django backend
      const response = await fetch("http://127.0.0.1:8000/users/profile/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Attach the Token
        },
      });
  
      if (!response.ok) {
          // If token is invalid/expired, clean up and return null
          if(response.status === 401) {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
          }
          return null;
      }
  
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.log("GetCurrentUser Error:", error);
      return null;
    }
  }