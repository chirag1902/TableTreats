import api from "./api";

export const signUp = async (userData) => {
  try {
    const response = await api.post("/auth/customers/signup", {
      full_name: userData.full_name, // matches backend schema
      email: userData.email,
      password: userData.password,
    });
    return response.data;
  } catch (err) {
    // Always throw an object with a 'detail' property
    if (err.response && err.response.data) {
      throw err.response.data; // backend error
    } else {
      throw { detail: err.message }; // fallback
    }
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/customers/login", credentials);
    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      throw err.response.data;
    } else {
      throw { detail: err.message };
    }
  }
};

// export const logIn = async (credentials) => {
//   const response = await fetch("YOUR_API_ENDPOINT/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(credentials),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw error;
//   }

//   return response.json();
// };
