import React, { useContext } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { UserContext } from "./UserContext";

const CustomDrawer = (props) => {
  const { logout } = useContext(UserContext);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      <DrawerItemList {...props} />
      <View style={styles.signOutContainer}>
        <Button title="Sign Out" onPress={logout} color="#FF6D6D" />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  signOutContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  labelStyle: {
    color: "#FFFFFF",
  },
});

export default CustomDrawer;
