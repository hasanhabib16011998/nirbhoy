import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export async function createUserAccount(user) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register/`, {
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

export async function createProfessionalAccount(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register-pro/`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.log("Pro API Error:", error);
    throw error;
  }
}

export async function signInAccount(user) {
  try {
    console.log(user);
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
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
    const response = await fetch(`${API_BASE_URL}/users/profile/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Attach the Token
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
      await fetch(`${API_BASE_URL}/users/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // We need auth to logout
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

export async function createPost(formData) {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    // We don't need to build FormData here anymore, 
    // because your onSubmit function already did it perfectly!

    // 1. Send Request directly with the received formData
    const response = await fetch(`${API_BASE_URL}/posts/create/`, {
      method: "POST",
      headers: {
        // NOTE: Do NOT set "Content-Type": "multipart/form-data" manually.
        // The browser sets it automatically with the correct boundary.
        Authorization: `Bearer ${token}`,
      },
      body: formData, // ✅ Pass the formData directly here
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

export async function getRecentPosts() {
  try {
    const token = localStorage.getItem("accessToken");

    // NOTE: If you made the view public (AllowAny), you can remove the headers.
    const response = await fetch(`${API_BASE_URL}/posts/recent/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await response.json();
    console.log(data);

    // Django REST Framework returns the array directly (or inside 'results' if using pagination)
    // If you used generics.ListAPIView without pagination, it's just the array.
    return { documents: data };
  } catch (error) {
    console.log("Get Recent Posts Error:", error);
    return null;
  }
}

export async function getPostById(postId) {
  if (!postId) return null;

  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch post");
    }

    const data = await response.json();
    return data; // Returns the single Post object
  } catch (error) {
    console.log("Get Post By ID Error:", error);
    return null;
  }
}

export async function getUsers(limit) {
  try {
    const token = localStorage.getItem("accessToken");

    // 1. Construct URL with query parameter if limit exists
    let url = `${API_BASE_URL}/users/list/`;
    if (limit) {
      url += `?limit=${limit}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    // 2. Wrap in 'documents' to match your Home.tsx structure
    return { documents: data };
  } catch (error) {
    console.log("Get Users Error:", error);
    return null; // Return null so React Query knows it failed
  }
}

export async function getUsersByGroup(limit, group) {
  try {
    const token = localStorage.getItem("accessToken");

    // Construct URL with multiple query parameters
    const url = new URL(`${API_BASE_URL}/users/group/`);
    if (limit) url.searchParams.append("limit", limit.toString());
    if (group) url.searchParams.append("group", group);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch users");

    const data = await response.json();
    return { documents: data };
  } catch (error) {
    console.log("Get Users Error:", error);
    return null;
  }
}

// 1. LIKE POST
export async function likePost(postId, likesArray) {
  try {
    const token = localStorage.getItem("accessToken");

    // We use PATCH or PUT because we are updating a specific field
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // We send the array to the backend
      body: JSON.stringify({ likes: likesArray }),
    });

    if (!response.ok) throw new Error("Failed to like post");
    return await response.json();
  } catch (error) {
    console.log("Like Post Error:", error);
    throw error;
  }
}

// 2. SAVE POST (Handles both Save and Delete/Unsave)
export async function savePost(postId) {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/save/`, {
      method: "POST", // POST is used for toggling
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to save post");
    return await response.json();
  } catch (error) {
    console.log("Save Error:", error);
    throw error;
  }
}

export async function getUserPosts(userId) {
  if (!userId) return null;

  try {
    const response = await axios.get(`${API_BASE_URL}/posts/user/${userId}/`,{
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.log("Get User Posts Error:", error);
    return null;
  }
}

export async function getUserLikedPosts(userId) {
  if (!userId) return null;

  try {
    const response = await axios.get(`${API_BASE_URL}/posts/user/${userId}/liked/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.log("Get Liked Posts Error:", error);
    return null;
  }
}

export async function getUserById(userId) {
  // 1. validation: Don't make a request if ID is missing
  if (!userId) return null;

  try {
    const token = localStorage.getItem("accessToken");

    // 2. Call the Django backend
    const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    // 3. Return the JSON (It will contain: id, name, bio, posts, etc.)
    return await response.json();
  } catch (error) {
    console.log("Get User By ID Error:", error);
    return null;
  }
}

export async function updateUser({ id, userData }) {
  try {
    const response = await axios.patch(`${API_BASE_URL}/users/${id}/`, userData, {
      headers: getAuthHeaders()
    });

    return response.data;
  } catch (error) {
    console.error("Server Error Details:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
}

export async function getSavedPosts() {
  try {
    const token = localStorage.getItem("accessToken");

    // NOTE: If you made the view public (AllowAny), you can remove the headers.
    const response = await fetch(`${API_BASE_URL}/posts/saved/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.log("Get Recent Posts Error:", error);
    return null;
  }
}

export async function getSosData() {
  const token = localStorage.getItem("accessToken");
  const response = await fetch(`${API_BASE_URL}/complains/dashboard/`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch SOS dashboard data");
  }

  return await response.json();
}

export const fetchLegalAidDashboard = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (!token) throw new Error("No authentication token found");

    const response = await axios.get(`${API_BASE_URL}/complains/legal-aid/dashboard/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching legal aid data:", error);
    // You must re-throw the error so TanStack Query can catch it and set isError to true
    throw error; 
  }
};

export const fetchLegalAidById = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/complains/legal-aid/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching case details:", error);
    throw error;
  }
};

export const fetchComments = async (modelName, objectId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/complains/comments/${modelName}/${objectId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addComment = async ({ modelName, objectId, text }) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(`${API_BASE_URL}/complains/comments/${modelName}/${objectId}/`, 
    { text },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const fetchResolveStatus = async (modelName, objectId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/complains/resolve-status/${modelName}/${objectId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update the resolution status
export const updateResolveStatus = async ({ modelName, objectId, updateData }) => {
  const token = localStorage.getItem("accessToken");
  // updateData will be an object like: { is_resolved_user: true, user_review: "Great help!" }
  const response = await axios.patch(
    `${API_BASE_URL}/complains/resolve-status/${modelName}/${objectId}/`, 
    updateData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const fetchActiveSos = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/complains/active/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    // A 404 just means no active SOS exists right now. Return null instead of an error.
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const fetchSosById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/complains/${id}/`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const triggerSosAlert = async (sosData) => {
  const response = await axios.post(`${API_BASE_URL}/complains/trigger/`, sosData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const resolveSosAlert = async (id) => {
  const response = await axios.patch(`${API_BASE_URL}/complains/${id}/resolve/`, {}, {
    headers: getAuthHeaders(),
  });
  return response.data;
};