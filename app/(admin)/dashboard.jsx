import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const SideNavbar = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const widthAnim = new Animated.Value(expanded ? 200 : 60);

  const toggleSidebar = () => {
    setExpanded(!expanded);
    Animated.timing(widthAnim, {
      toValue: expanded ? 60 : 200,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const actions = [
    { name: 'add-circle', text: 'Add Product', route: 'add-product' },
    { name: 'list', text: 'Manage Products', route: 'manage-products' },
    { name: 'grid', text: 'Category', route: 'admincategory' },
    { name: 'receipt', text: 'View Orders', route: 'orders' },
  ];

  return (
    <Animated.View style={[styles.sidebar, { width: widthAnim }]}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
        <Ionicons name={expanded ? 'chevron-back' : 'menu'} size={30} color={Colors.PRIMARY} />
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => {
              router.push(action.route);
              if (!expanded) toggleSidebar(); // Expand if collapsed
            }}
          >
            <Ionicons name={action.name} size={24} color={Colors.PRIMARY} />
            {expanded && <Text style={styles.actionButtonText}>{action.text}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 10,
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionsContainer: {
    flexDirection: 'column',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    // padding: 12,
    paddingVertical: 5,  // Top and Bottom padding
    paddingHorizontal: 10, // Left and Right padding
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: 'rgb(65, 99, 129)',  // Color of the shadow
    shadowOffset: { width: 8, height: 3 },  // The shadow's position (horizontal and vertical)
    shadowOpacity: 0.5,  // The transparency of the shadow (range from 0 to 1)
    shadowRadius: 5,  // The blur radius of the shadow
    elevation: 3,  // Only for Android, to apply shadow effect
    
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  
});

export default SideNavbar;
