import React, { useEffect, useState } from 'react';
import { validatePassword } from '@/utils/validations/inputValidations';
import ThemedInput from './ThemedInput';

interface InputPasswordProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onValidChange?: (isValid: boolean) => void;
  placeholder?: string;
}

const InputPassword: React.FC<InputPasswordProps> = ({
  label,
  value,
  onChangeText,
  onValidChange,
  placeholder = 'Enter your password',
}) => {
  const [isValid, setIsValid] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    const valid = validatePassword(value);
    setIsValid(valid);
    onValidChange?.(valid);
  }, [value, onValidChange]);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <div className="relative w-full">
      <ThemedInput
        label={label}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        type={isSecure ? 'password' : 'text'}
        isValid={isValid}
        errorMessage="Password must be at least 8 characters long"
      />
      <button
        onClick={toggleSecureEntry}
        className="absolute right-3 top-10"
      >
        <span className="material-icons text-neutral-text-secondary"
        >

          {isSecure ? 'visibility_off' : 'visibility'}
        </span>
      </button>
    </div>
  );
};

export default InputPassword;