import { React } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { SignupCredentials } from '../../types/auth';

interface SignupFormProps {
  onSubmit: (credentials: SignupCredentials) => Promise<void>;
  loading?: boolean;
}

export function SignupForm({ onSubmit, loading }: SignupFormProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, email, password, confirmPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="•••••••••"
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="•••••••••"
        required
      />
      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  );
}
