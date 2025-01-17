import { ReactNode } from 'react';

interface InputProps {
  name: string;
  onChange: (e: { target: { name: string; value: any } }) => void;
  value: string;
  intlLabel: { id: string; defaultMessage: string };
  disabled?: boolean;
  error?: string;
  description?: { id: string; defaultMessage: string };
  required?: boolean;
  children?: ReactNode;
}

declare const Input: React.FC<InputProps>;

export default Input;   