import React, { useEffect, useState } from 'react';
import ThemedInput from './ThemedInput';

interface InputTitleProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onValidChange?: (isValid: boolean) => void;
  placeholder?: string;
}

const InputTitle: React.FC<InputTitleProps> = ({
  label,
  value,
  onChangeText,
  onValidChange,
  placeholder = 'Enter course title',
}) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isValidTitle = value.trim().length > 0;
    setIsValid(isValidTitle);
    onValidChange?.(isValidTitle);
  }, [value, onValidChange]);

  return (
    <ThemedInput
      label={label}
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      placeholder={placeholder}
      isValid={isValid}
      errorMessage="Title cannot be empty"
    />
  );
};

export default InputTitle;