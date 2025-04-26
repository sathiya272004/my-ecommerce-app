// Format currency
export const formatCurrency = (amount) => {
    return `$${Number.parseFloat(amount).toFixed(2)}`
  }
  
  // Format date
  export const formatDate = (date) => {
    if (!date) return "Unknown date"
  
    if (typeof date === "string") {
      date = new Date(date)
    }
  
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  // Validate email
  export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Generate a random order ID
  export const generateOrderId = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }
  
  // Get status color
  export const getStatusColor = (status) => {
    switch (status) {
      case "Processing":
        return "#f39c12"
      case "Shipped":
        return "#3498db"
      case "Delivered":
        return "#2ecc71"
      case "Cancelled":
        return "#e74c3c"
      default:
        return "#7f8c8d"
    }
  }
  
  // Truncate text
  export const truncateText = (text, maxLength) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
  }
  
  // Calculate discount percentage
  export const calculateDiscountPercentage = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  }
  
  // Debounce function for search
  export const debounce = (func, delay) => {
    let timeoutId
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
  }
  
  