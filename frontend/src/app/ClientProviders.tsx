"use client";

import { usePathname } from "next/navigation";
import StyledComponentsRegistry from "../lib/registry";
import { ThemeRegistry } from "../lib/ThemeRegistry";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import { ToastProvider } from "@/lib/ToasteContext";
import AppFrame from "@/components/AppFrame";
import { useBudgetStream } from "@/hooks/useBudgetStream";
import { useGetMeQuery } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector } from "@/redux/slices/userSlice";

function LiveBudgetStream() {
  const pathname = usePathname();
  const authed = useAppSelector(userAuthenticatedSelector);
  const onAuthPage = pathname.startsWith("/auth");
  const { data } = useGetMeQuery(undefined, { skip: onAuthPage });
  useBudgetStream(!onAuthPage && authed && Boolean(data));
  return null;
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <LiveBudgetStream />
      <StyledComponentsRegistry>
        <ThemeRegistry>
          <ToastProvider>
            <AppFrame>{children}</AppFrame>
          </ToastProvider>
        </ThemeRegistry>
      </StyledComponentsRegistry>
    </Provider>
  );
}
