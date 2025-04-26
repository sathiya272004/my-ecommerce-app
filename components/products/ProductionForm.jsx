"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Text } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"
import Input from "../ui/Input"
import Button from "../ui/Button"
import { Colors } from "../../constants/Colors"
import { fetchCategories } from "../../services/api"

const ProductForm = ({
  initialValues = {
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    stock: "",
    images: [],
  },
  onSubmit,
  submitButtonText = "Save Product",
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoriesData = await fetchCategories()
        setCategories(categoriesData)

        // Set selected category if initialValues has categoryId
        if (initialValues.categoryId) {
          const category = categoriesData.find((cat) => cat.id === initialValues.categoryId)
          if (category) {
            setSelectedCategory(category)
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        Alert.alert("Error", "Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }

    getCategories()
  }, [initialValues.categoryId])

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      })
    }
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
    handleChange("categoryId", category.id)
    setShowCategoryDropdown(false)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name) newErrors.name = "Product name is required"
    if (!formData.description) newErrors.description = "Description is required"

    if (!formData.price) {
      newErrors.price = "Price is required"
    } else if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number"
    }

    if (
      formData.originalPrice &&
      (isNaN(Number.parseFloat(formData.originalPrice)) || Number.parseFloat(formData.originalPrice) <= 0)
    ) {
      newErrors.originalPrice = "Original price must be a positive number"
    }

    if (!formData.categoryId) newErrors.categoryId = "Category is required"

    if (!formData.stock) {
      newErrors.stock = "Stock quantity is required"
    } else if (isNaN(Number.parseInt(formData.stock)) || Number.parseInt(formData.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number"
    }

    if (!formData.images || formData.images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    // Convert string values to numbers
    const processedData = {
      ...formData,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
      originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
    }

    onSubmit(processedData)
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions to upload images")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = [...formData.images, result.assets[0].uri]
        handleChange("images", newImages)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index)
    handleChange("images", updatedImages)
  }

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Product Name"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        placeholder="Enter product name"
        error={errors.name}
      />

      <Input
        label="Description"
        value={formData.description}
        onChangeText={(text) => handleChange("description", text)}
        placeholder="Enter product description"
        multiline
        numberOfLines={4}
        error={errors.description}
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Input
            label="Price"
            value={formData.price}
            onChangeText={(text) => handleChange("price", text)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.price}
          />
        </View>

        <View style={styles.halfInput}>
          <Input
            label="Original Price (Optional)"
            value={formData.originalPrice}
            onChangeText={(text) => handleChange("originalPrice", text)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={errors.originalPrice}
          />
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={[styles.categorySelector, errors.categoryId && styles.errorInput]}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          <Text style={selectedCategory ? styles.categoryText : styles.placeholderText}>
            {selectedCategory ? selectedCategory.name : "Select a category"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.MUTED} />
        </TouchableOpacity>
        {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}

        {showCategoryDropdown && (
          <View style={styles.dropdown}>
            {loadingCategories ? (
              <Text style={styles.dropdownItem}>Loading categories...</Text>
            ) : categories.length === 0 ? (
              <Text style={styles.dropdownItem}>No categories found</Text>
            ) : (
              categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.dropdownItem}
                  onPress={() => selectCategory(category)}
                >
                  <Text style={styles.dropdownItemText}>{category.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>

      <Input
        label="Stock Quantity"
        value={formData.stock}
        onChangeText={(text) => handleChange("stock", text)}
        placeholder="0"
        keyboardType="number-pad"
        error={errors.stock}
      />

      <View style={styles.imagesSection}>
        <Text style={styles.label}>Product Images</Text>
        <View style={styles.imagesContainer}>
          {formData.images.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
            <Ionicons name="add" size={30} color="#ccc" />
          </TouchableOpacity>
        </View>
        {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
      </View>

      <Button title={submitButtonText} onPress={handleSubmit} loading={loading} style={styles.submitButton} fullWidth />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.TEXT,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    backgroundColor: Colors.CARD,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.PLACEHOLDER,
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    backgroundColor: Colors.CARD,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  imagesSection: {
    marginBottom: 20,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageWrapper: {
    position: "relative",
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.DANGER,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageBtn: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderStyle: "dashed",
    margin: 5,
  },
  errorInput: {
    borderColor: Colors.DANGER,
  },
  errorText: {
    color: Colors.DANGER,
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    marginVertical: 20,
  },
})

export default ProductForm

