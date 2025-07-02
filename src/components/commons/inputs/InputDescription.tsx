import React, { useEffect, useState } from 'react';
import ThemedInput from './ThemedInput';

interface InputDescriptionProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onValidChange?: (isValid: boolean) => void;
  placeholder?: string;
}

const InputDescription: React.FC<InputDescriptionProps> = ({
  label,
  value,
  onChangeText,
  onValidChange,
  placeholder = 'Enter course description',
}) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isValidDescription = value.trim().length > 0;
    setIsValid(isValidDescription);
    onValidChange?.(isValidDescription);
  }, [value, onValidChange]);

  return (
    <ThemedInput
      label={label}
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      placeholder={placeholder}
    //   multiline
    //   rows={4}
      isValid={isValid}
      errorMessage="Description cannot be empty"
    />
  );
};

export default InputDescription;