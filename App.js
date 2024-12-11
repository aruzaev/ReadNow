import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Signin from "./screens/Signin";
import Home from "./screens/Home";
import { UserContext, UserProvider } from "./UserContext";
import CustomDrawer from "./CustomDrawer";
import ReadingList from "./screens/ReadingList";
import Account from "./screens/Account";
import Upload from "./screens/Upload";
import TestDocumentPicker from "./screens/TestDocumentPicker";
import { View, ActivityIndicator, Text } from "react-native";
import Reader from "./screens/Reader";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { user } = React.useContext(UserContext);
  const username = user?.data?.user?.name || "Account";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: "#121212",
        },
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#BBBBBB",
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Upload Files" component={Upload} />
      <Drawer.Screen name="Testing" component={TestDocumentPicker} />
      <Drawer.Screen name="Reading List" component={ReadingList} />
      <Drawer.Screen
        name="Account"
        component={Account}
        options={{
          drawerLabel: username,
        }}
      />
    </Drawer.Navigator>
  );
};

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <UserContext.Consumer>
          {({ user, loading }) => {
            if (loading) {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={{ marginTop: 10, color: "#888" }}>
                    Loading...
                  </Text>
                </View>
              );
            }
            return (
              <Stack.Navigator
                initialRouteName={user ? "DrawerNavigator" : "SignIn"}
                screenOptions={{
                  headerStyle: { backgroundColor: "#121212" },
                  headerTintColor: "#FFFFFF",
                }}
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
                <Stack.Screen name="Reader" component={Reader} />
              </Stack.Navigator>
            );
          }}
        </UserContext.Consumer>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
