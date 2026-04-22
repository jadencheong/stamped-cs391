'use client';

/**
 * app/signup/page.tsx
 *
 * Signup page for new users.
 * Accepts username, email, password, and confirm password.
 * On success, shows a "check your email" message rather than redirecting
 * since the user needs to verify their email before logging in.
 *
 * Created by: Ellen
 */

import { useState } from 'react';
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

const Input = styled.input<{ $hasError?: boolean }>`
    padding: 0.75rem 1rem;
    border: 1.5px solid ${props => props.$hasError ? '#BF7245' : '#d5e4e8'};
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
        border-color: ${props => props.$hasError ? '#BF7245' : '#5C9EAD'};
        box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(191, 114, 69, 0.15)' : 'rgba(92, 158, 173, 0.15)'};
        background: #ffffff;
    }
`;

const FieldError = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.75rem;
    color: #BF7245;
    margin: 0;
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 0.85rem;
    background-color: #F19C4C;
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
    animation-delay: 0.7s;

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

const SuccessCard = styled.div`
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    animation: ${fadeUp} 0.4s ease-out both;
`;

const SuccessIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #326273;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
`;

const SuccessTitle = styled.h2`
    font-family: 'Helvetica', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #326273;
    margin: 0;
`;

const SuccessText = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.88rem;
    color: #5C9EAD;
    margin: 0;
    line-height: 1.6;
`;

const FooterText = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.82rem;
    color: #5C9EAD;
    text-align: center;
    margin-top: 1.5rem;
    animation: ${fadeUp} 0.4s ease-out both;
    animation-delay: 0.8s;
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

const GlobalError = styled.p`
    font-family: 'Helvetica', sans-serif;
    font-size: 0.82rem;
    color: #BF7245;
    margin: 0.5rem 0 0;
    text-align: center;
`;

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [success, setSuccess] = useState(false);

    // individual field errors
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const validate = () => {
        const newErrors = { username: '', email: '', password: '', confirmPassword: '' };
        let isValid = true;

        if (!username.trim()) {
            newErrors.username = 'Username is required.';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email.';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required.';
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
            isValid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
            isValid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        setGlobalError('');
        if (!validate()) return;

        setIsLoading(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setGlobalError(data.message || 'Something went wrong.');
                return;
            }

            setSuccess(true);
        } catch (err) {
            setGlobalError('Something went wrong. Please try again.');
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

                {success ? (
                    <SuccessCard>
                        <SuccessIcon>✓</SuccessIcon>
                        <SuccessTitle>Check your email!</SuccessTitle>
                        <SuccessText>
                            We sent a verification link to <strong>{email}</strong>.
                            Click it to activate your account before logging in.
                        </SuccessText>
                        <FooterLink href="/login">Back to login</FooterLink>
                    </SuccessCard>
                ) : (
                    <>
                        <FormTitle>Create an account</FormTitle>

                        <FieldWrapper $delay="0.3s">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="yourname"
                                value={username}
                                $hasError={!!errors.username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            {errors.username && <FieldError>{errors.username}</FieldError>}
                        </FieldWrapper>

                        <FieldWrapper $delay="0.4s">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                $hasError={!!errors.email}
                                onChange={e => setEmail(e.target.value)}
                            />
                            {errors.email && <FieldError>{errors.email}</FieldError>}
                        </FieldWrapper>

                        <FieldWrapper $delay="0.5s">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                $hasError={!!errors.password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            {errors.password && <FieldError>{errors.password}</FieldError>}
                        </FieldWrapper>

                        <FieldWrapper $delay="0.6s">
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                $hasError={!!errors.confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
                        </FieldWrapper>

                        {globalError && <GlobalError>{globalError}</GlobalError>}

                        <SubmitButton onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </SubmitButton>

                        <FooterText>
                            Already have an account?{' '}
                            <FooterLink href="/login">Log in</FooterLink>
                        </FooterText>
                    </>
                )}
            </Card>
        </PageWrapper>
    );
}