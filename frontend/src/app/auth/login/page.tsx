"use client";
import { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { handleLogin } from "@/redux/thunk";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 100px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const Input = styled.input`
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

export default function LoginPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleUserLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(handleLogin({ email, password }));
        debugger;
        if (handleLogin.fulfilled.match(result)) {
            router.push("/dashboard");
        } else {
            alert("Login failed. Please try again.");
        }
    };

    return (
        <Container>
            <h2>Login to SpendSmart</h2>
            <form onSubmit={handleUserLogin}>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <Button type="submit">Login</Button>
            </form>
        </Container>
    );
}
