import { StyleSheet } from "react-native"
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "../constants/Theme"

export const homeStyles = StyleSheet.create({
  container: {
    padding: Spacing.SPACE_REGULAR,
    marginTop: 40,
    backgroundColor: Colors.BACKGROUND,
  },

  // Search section
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: BorderRadius.RADIUS_LARGE,
    paddingHorizontal: Spacing.SPACE_MEDIUM,
    marginBottom: Spacing.SPACE_MEDIUM,
    backgroundColor: Colors.SURFACE,
    ...Shadows.SHADOW_SMALL,
  },
  input: {
    flex: 1,
    height: 50,
    fontFamily: Typography.BODY_FONT,
    fontSize: Typography.FONT_SIZE_REGULAR,
    color: Colors.TEXT_PRIMARY,
  },

  // Search results dropdown
  dropdown: {
    marginTop: Spacing.SPACE_MEDIUM,
    backgroundColor: Colors.SURFACE,
    borderRadius: BorderRadius.RADIUS_LARGE,
    ...Shadows.SHADOW_MEDIUM,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  item: {
    flexDirection: "row",
    padding: Spacing.SPACE_MEDIUM,
    borderBottomColor: Colors.DIVIDER,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    marginRight: Spacing.SPACE_MEDIUM,
    borderRadius: BorderRadius.RADIUS_MEDIUM,
  },

  // Section titles
  sectionTitle: {
    fontFamily: Typography.TITLE_FONT,
    fontSize: Typography.FONT_SIZE_XLARGE,
    color: Colors.PRIMARY,
    marginTop: Spacing.SPACE_XLARGE,
    marginBottom: Spacing.SPACE_MEDIUM,
  },

  // Categories
  category: {
    width: 100,
    height: 100,
    marginRight: Spacing.SPACE_MEDIUM,
    borderRadius: BorderRadius.RADIUS_LARGE,
    overflow: "hidden",
    position: "relative",
    ...Shadows.SHADOW_MEDIUM,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.OVERLAY,
    paddingVertical: Spacing.SPACE_XS,
    alignItems: "center",
  },
  categoryText: {
    color: Colors.SURFACE,
    fontFamily: Typography.HEADING_FONT,
    fontSize: Typography.FONT_SIZE_MEDIUM,
  },

  // Product cards
  productCard: {
    width: 140,
    marginRight: Spacing.SPACE_MEDIUM,
    backgroundColor: Colors.SURFACE,
    padding: Spacing.SPACE_MEDIUM,
    borderRadius: BorderRadius.RADIUS_LARGE,
    ...Shadows.SHADOW_SMALL,
    marginBottom: Spacing.SPACE_MEDIUM,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: BorderRadius.RADIUS_MEDIUM,
    marginBottom: Spacing.SPACE_SMALL,
  },
  name: {
    fontFamily: Typography.HEADING_FONT,
    fontSize: Typography.FONT_SIZE_MEDIUM,
    color: Colors.TEXT_PRIMARY,
    marginBottom: Spacing.SPACE_XS,
  },
  price: {
    fontFamily: Typography.ACCENT_FONT,
    fontSize: Typography.FONT_SIZE_MEDIUM,
    color: Colors.PRIMARY,
  },
})
