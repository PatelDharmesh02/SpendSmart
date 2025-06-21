"use client";
import { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { checkAuth } from "@/redux/thunk";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector, userLoadingSelector } from "@/redux/slices/userSlice";
import Loader from "@/components/Loader";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector(userAuthenticatedSelector);
  const loading = useAppSelector(userLoadingSelector);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!loading) {
      router.push(isAuthenticated ? "/dashboard" : "/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  return <Container><Loader /></Container>;
}
