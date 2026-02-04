import { type INewUser, type ISignInUser, type INewPost } from "@/types";
import { success } from "zod";

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
    console.log(user);
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
    console.log(data);

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
      if (response.status === 401) {
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

export async function signOutAccount() {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // 1. If tokens exist, try to blacklist them on the backend
    if (accessToken && refreshToken) {
      await fetch("http://127.0.0.1:8000/users/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // We need auth to logout
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }

    // 2. CRITICAL: Always clear LocalStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Optional: Clear any other user data
    localStorage.removeItem("user");

    return { success: true };

  } catch (error) {
    console.log("Logout Error:", error);
    // Even if backend fails, we must clear frontend storage to "log out" the user
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return { success: false };
  }
}

export async function createPost(post: INewPost) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    // 1. Create FormData object
    const formData = new FormData();
    
    // 2. Append text fields
    formData.append("caption", post.caption);
    formData.append("location", post.location || "");
    formData.append("tags", post.tags || "");
    
    // 3. Append the File
    // Note: post.file is likely a FileList or array from react-dropzone/hook-form
    if (post.file && post.file.length > 0) {
      formData.append("image", post.file[0]); 
    }

    // 4. Send Request
    const response = await fetch("http://127.0.0.1:8000/posts/create/", {
      method: "POST",
      headers: {
        // NOTE: Do NOT set "Content-Type": "multipart/form-data" manually.
        // The browser sets it automatically with the correct boundary when using FormData.
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
    }

    return await response.json();

  } catch (error) {
    console.log("Create Post Error:", error);
    throw error;
  }
}