import React, { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden, setStatusBarStyle } from "expo-status-bar";

interface FullScreenConfigProps {
  children: React.ReactNode;
  hideStatusBar?: boolean;
  hideNavigationBar?: boolean;
  statusBarStyle?: "auto" | "inverted" | "light" | "dark";
}

export const FullScreenConfig: React.FC<FullScreenConfigProps> = ({
  children,
  hideStatusBar = true,
  hideNavigationBar = false,
  statusBarStyle = "light",
}) => {
  useEffect(() => {
    const configureFullScreen = async () => {
      try {
        // Configure status bar
        if (hideStatusBar) {
          setStatusBarHidden(true, "fade");
        } else {
          setStatusBarHidden(false, "fade");
          setStatusBarStyle(statusBarStyle);
        }

        // Configure navigation bar (Android only)
        if (Platform.OS === "android") {
          if (hideNavigationBar) {
            await NavigationBar.setVisibilityAsync("hidden");
          } else {
            await NavigationBar.setVisibilityAsync("visible");
            await NavigationBar.setBackgroundColorAsync("#000000");
          }
        }
      } catch (error) {
        console.warn("Error configuring full screen:", error);
      }
    };

    configureFullScreen();
  }, [hideStatusBar, hideNavigationBar, statusBarStyle]);

  return <>{children}</>;
};
