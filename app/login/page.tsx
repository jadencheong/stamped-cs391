'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';

// colors
// blue slate: #326273
// pacific blue: #5C9EAD
// sky blue: #7DC4D4
// cinnamon wood: #BF7245
// sandy brown: #F19C4C
// platinum: #EEEEEE

const fadeUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const stampIn = keyframes`
    0% {
        opacity: 0;
        transform: scale(1.15) rotate(-2deg);
        filter: blur(3px);
    }
    70% {
        transform: scale(0.97) rotate(0.5deg);
    }
    100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
        filter: blur(0);
    }
`;

const PageWrapper = styled.div`
    min-height: 100vh;
    background-color: #EEEEEE;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
`;

const Card = styled.div`
    background: #ffffff;
    border-radius: 1.5rem;
    padding: 3rem 2.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 40px rgba(50, 98, 115, 0.12);
    animation: ${fadeUp} 0.4s ease-out both;
`;

const LogoBlock = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2.5rem;
    animation: ${stampIn} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: 0.1s;
`;

const StampBorder = styled.div`
    display: inline-block;
    border: 3px solid #326273;
    border-radius: 6px;
    padding: 0.5rem 1.75rem;
    position: relative;

    &::before,
    &::after {
        content: '';
        display: block;
        position: absolute;
        left: -3px;
        right: -3px;
        height: 7px;
        border-left: 3px solid #326273;
        border-right: 3px solid #326273;
    }

    &::before { top: 6px; }
    &::after  { bottom: 6px; }
`;

const AppName = styled.h1`
    font-family: Unbounded, sans-serif;
    font-size: 3rem;
    font-weight: 500;
    color: #326273;
    margin: 0;
    line-height: 1;
    text-transform: uppercase;
`;

const FormTitle = styled.h2`
    font-family: 'Helvetica', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #326273;
    margin: 0 0 1.5rem;
    animation: ${fadeUp} 0.4s ease-out both;
    animation-delay: 0.2s;
`;

const FieldWrapper = styled.div<{ $delay: string }>`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.1rem;
    animation: ${fadeUp} 0.4s ease-out both;
    animation-delay: ${props => props.$delay};
`;

const Label = styled.label`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #326273;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    border: 1.5px solid #d5e4e8;
    border-radius: 0.6rem;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.95rem;
    color: #326273;
    background: #f8fbfc;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &::placeholder {
        color: #a8c5cd;
    }

    &:focus {
        border-color: #5C9EAD;
        box-shadow: 0 0 0 3px rgba(92, 158, 173, 0.15);
        background: #ffffff;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 0.85rem;
    background-color: #BF7245;
    color: #ffffff;
    font-family: 'Helvetica', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    margin-top: 0.5rem;
    box-shadow: 0 4px 14px rgba(50, 98, 115, 0.3);
    transition: all 0.2s ease-in-out;
    animation: ${fadeUp} 0.4s ease-out both;
    animation-delay: 0.5s;

    &:hover:not(:disabled) {
        filter: brightness(1.1);
        transform: translateY(-2px);
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.82rem;
    color: #BF7245;
    margin: 0.5rem 0 0;
    text-align: center;
`;

const FooterText = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.82rem;
    color: #5C9EAD;
    text-align: center;
    margin-top: 1.5rem;
    animation: ${fadeUp} 0.4s ease-out both;
    animation-delay: 0.6s;
`;

const FooterLink = styled.a`
    color: #326273;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState(''); // email or username
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');

        if (!identifier.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login failed.');
                return;
            }

            // save user ID to localStorage so other pages know who is logged in
            localStorage.setItem('userId', data.user._id);

            // redirect to home/feed on success
            router.push('/');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper>
            <Card>
                <LogoBlock>
                    <StampBorder>
                        <AppName>Stamped</AppName>
                    </StampBorder>
                </LogoBlock>

                <FormTitle>Welcome back</FormTitle>

                <FieldWrapper $delay="0.3s">
                    <Label htmlFor="identifier">Email or username</Label>
                    <Input
                        id="identifier"
                        type="text"
                        placeholder="you@example.com or @username"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                    />
                </FieldWrapper>

                <FieldWrapper $delay="0.4s">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </FieldWrapper>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <SubmitButton onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log in'}
                </SubmitButton>

                <FooterText>
                    Don&apos;t have an account?{' '}
                    <FooterLink href="/signup">Sign up</FooterLink>
                </FooterText>
            </Card>
        </PageWrapper>
    );
}