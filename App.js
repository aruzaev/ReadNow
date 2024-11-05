import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Signin from "./screens/Signin";
import Home from "./screens/Home";
import { UserContext, UserProvider } from "./UserContext";
import CustomDrawer from "./CustomDrawer";
import ReadingList from "./screens/ReadingList";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawer {...props} />}>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Reading List" component={ReadingList} />
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <UserContext.Consumer>
          {({ user }) => (
            <Stack.Navigator
              initialRouteName={user ? "DrawerNavigator" : "SignIn"}
            >
              {!user ? (
                <Stack.Screen name="SignIn" component={Signin} />
              ) : (
                <Stack.Screen
                  name="DrawerNavigator"
                  component={DrawerNavigator}
                  options={{ headerShown: false }}
                />
              )}
            </Stack.Navigator>
          )}
        </UserContext.Consumer>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
