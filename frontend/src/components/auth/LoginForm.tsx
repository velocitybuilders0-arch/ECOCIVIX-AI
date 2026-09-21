import { React } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
