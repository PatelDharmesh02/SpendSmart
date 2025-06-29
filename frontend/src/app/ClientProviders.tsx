"use client";

import StyledComponentsRegistry from "../lib/registry";
import { ThemeRegistry } from "../lib/ThemeRegistry";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ToastProvider } from "@/lib/ToasteContext";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <StyledComponentsRegistry>
        <ThemeRegistry>
          <ToastProvider>{children}</ToastProvider>
        </ThemeRegistry>
      </StyledComponentsRegistry>
    </Provider>
  );
}
