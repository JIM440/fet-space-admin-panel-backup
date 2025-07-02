import React, { useEffect, useState } from 'react';
import ThemedInput from './ThemedInput';
import { validateMatricule } from '@/utils/validations/inputValidations';

interface InputMatriculeProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onValidChange?: (isValid: boolean) => void;
  placeholder?: string;
}

const InputMatricule: React.FC<InputMatriculeProps> = ({
  label,
  value,
  onChangeText,
  onValidChange,
  placeholder = 'Enter your matricule (e.g., fe12a345)',
}) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = validateMatricule(value);
    setIsValid(valid);
    onValidChange?.(valid);
  }, [value, onValidChange]);

  return (
    <ThemedInput
      label={label}
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      placeholder={placeholder}
      autoCapitalize="none"
      isValid={isValid}
      errorMessage="Matricule must be in the format fe##a### (e.g., fe12a345)"
    />
  );
};

export default InputMatricule;