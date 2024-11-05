import React, { useContext } from "react";
import { View, Button, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { UserContext } from "./UserContext";

const CustomDrawer = (props) => {
  const { logout } = useContext(UserContext);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.signOutContainer}>
        <Button title="Sign Out" onPress={logout} />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  signOutContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
});

export default CustomDrawer;
