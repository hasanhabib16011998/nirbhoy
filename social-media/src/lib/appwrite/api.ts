import { type INewUser } from "@/types";

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