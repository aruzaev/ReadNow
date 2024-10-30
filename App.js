import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Signin from "./screens/Signin";
import Home from "./screens/Home";
import { UserContext, UserProvider } from "./UserContext";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <UserContext.Consumer>
          {({ user }) => (
            <Stack.Navigator initialRouteName={user ? "Home" : "SignIn"}>
              {!user ? (
                <Stack.Screen name="SignIn" component={Signin} />
              ) : (
                <Stack.Screen name="Home" component={Home} />
              )}
            </Stack.Navigator>
          )}
        </UserContext.Consumer>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
