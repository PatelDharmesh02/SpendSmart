'use client';
import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { checkAuth, handleLogin } from '@/redux/thunk';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import Loader from '@/components/Loader';
import Link from 'next/link';
import FinancialAnalyticsAnimation from '@/components/BackgroundAnimation';
import { PresentionChart, Eye, EyeSlash } from 'iconsax-react';
import { userAuthenticatedSelector, userLoadingSelector } from '@/redux/slices/userSlice';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.background || '#fff'};
`;

const AnimationWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/finance-bg.png');
    background-size: cover;
    background-position: center;
    opacity: 0.7;
    filter: blur(2px) brightness(0.9);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 2;
  }
`;


const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 0 1rem;
  z-index: 1;
`;

const Title = styled.h1`
  text-align: center;
  color: ${({ theme }) => theme.textPrimary || '#111'};
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 2rem;
`;

const StyledCard = styled(Card)`
  padding: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadow?.lg || '0 6px 12px rgba(0,0,0,0.1)'};
  border: 1px solid ${({ theme }) => theme.border || '#ddd'};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.textSecondary || '#666'};
  font-size: 0.875rem;
`;

const OAuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 0;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.border || '#ddd'};
  }
`;

const DividerText = styled.span`
  padding: 0 1rem;
  color: ${({ theme }) => theme.textSecondary || '#666'};
  font-size: 0.875rem;
`;

const OAuthButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surface || '#f9f9f9'};
  color: ${({ theme }) => theme.textPrimary || '#000'};
  border: 1px solid ${({ theme }) => theme.border || '#ccc'};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.primaryLight || '#eaeaea'};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow?.md};
  }
`;

const FooterText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.textSecondary || '#666'};
  margin-top: 1.5rem;

  a {
    color: ${({ theme }) => theme.primary || '#0070f3'};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.danger || 'red'};
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordToggleBtn = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.textSecondary || '#888'};
  display: flex;
  align-items: center;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;

  span {
    font-size: 24px;
    font-weight: 700;
    background: ${({ theme }) => theme.gradientPrimary || 'linear-gradient(to right, #0070f3, #00b4d8)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
`

// Google Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// GitHub Icon Component
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" fill="currentColor" />
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const isAuthenticated = useAppSelector(userAuthenticatedSelector);
  const isLoading = useAppSelector(userLoadingSelector)

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const routeHandler = () => {
    router.push("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await dispatch(handleLogin({ email, password, routeHandler }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <LoaderWrapper><Loader size="lg" /></LoaderWrapper>


  return (
    <LoginContainer>
      <AnimationWrapper>
        <FinancialAnalyticsAnimation />
      </AnimationWrapper>

      <FormContainer>
        <StyledCard>
          <LogoWrapper>
            <PresentionChart size="32" color={theme.primary} variant="Bold" />
            <span>SpendSmart</span>
          </LogoWrapper>

          <Title>Sign in to your account</Title>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <PasswordInputWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <PasswordToggleBtn
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash size="20" color={theme.textPrimary} /> : <Eye size="20" color={theme.textPrimary} />}
                </PasswordToggleBtn>
              </PasswordInputWrapper>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Button type="submit" $variant="primary" disabled={loading} $fullWidth>
              {loading ? <Loader size="sm" /> : 'Sign In'}
            </Button>
          </form>

          <Divider>
            <DividerText>or continue with</DividerText>
          </Divider>

          <OAuthContainer>
            <OAuthButton type="button">
              <GoogleIcon />
              <span>Sign in with Google</span>
            </OAuthButton>

            <OAuthButton type="button">
              <GitHubIcon />
              <span>Sign in with GitHub</span>
            </OAuthButton>
          </OAuthContainer>

          <FooterText>
            Don&apos;t have an account? <Link href="/auth/register">Sign up here</Link>
          </FooterText>
        </StyledCard>
      </FormContainer>
    </LoginContainer>
  );
}
