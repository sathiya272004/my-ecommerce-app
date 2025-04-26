import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "../firebase/config"

// Upload image to Firebase Storage
export const uploadImage = async (uri, path) => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()

    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, blob)

    return await getDownloadURL(storageRef)
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Upload product image
export const uploadProductImage = async (uri, productId) => {
  const filename = `products/${productId}/${Date.now()}`
  return uploadImage(uri, filename)
}

// Upload category image
export const uploadCategoryImage = async (uri, categoryId) => {
  const filename = `categories/${categoryId}/${Date.now()}`
  return uploadImage(uri, filename)
}

// Upload user profile image
export const uploadProfileImage = async (uri, userId) => {
  const filename = `users/${userId}/profile`
  return uploadImage(uri, filename)
}

// Delete image from Firebase Storage
export const deleteImage = async (url) => {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}

