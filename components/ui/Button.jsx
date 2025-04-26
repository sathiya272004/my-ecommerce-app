import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Colors } from "../../constants/Colors"

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  variant = "primary", // primary, secondary, outline, danger
  size = "medium", // small, medium, large
  fullWidth = false,
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: Colors.SECONDARY,
          borderColor: Colors.SECONDARY,
        }
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: Colors.PRIMARY,
          borderWidth: 1,
        }
      case "danger":
        return {
          backgroundColor: Colors.DANGER,
          borderColor: Colors.DANGER,
        }
      default:
        return {
          backgroundColor: Colors.PRIMARY,
          borderColor: Colors.PRIMARY,
        }
    }
  }

  const getTextStyle = () => {
    if (variant === "outline") {
      return { color: Colors.PRIMARY }
    }
    return { color: "#fff" }
  }

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
        }
      case "large":
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
        }
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
        }
    }
  }

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return { fontSize: 14 }
      case "large":
        return { fontSize: 18 }
      default:
        return { fontSize: 16 }
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? Colors.PRIMARY : "#fff"} size="small" />
      ) : (
        <Text style={[styles.text, getTextStyle(), getTextSizeStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "bold",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: "100%",
  },
})

export default Button

