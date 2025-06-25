'use client';
import { useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { checkAuth } from '@/redux/thunk';
import { userAuthenticatedSelector, userLoadingSelector } from '@/redux/slices/userSlice';
import Loader from '@/components/Loader';
import FinancialAnalyticsAnimation from '@/components/BackgroundAnimation';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const AnimationContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.5;
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
    if (!loading && isAuthenticated) {
      router.push(isAuthenticated ? "/dashboard" : "/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  return (
    <Container>
      <AnimationContainer>
        <FinancialAnalyticsAnimation />
      </AnimationContainer>
      <Loader size="lg" />
    </Container>
  );
}