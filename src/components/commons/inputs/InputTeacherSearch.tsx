import React, { useEffect, useState } from 'react';
import ThemedInput from './ThemedInput';

interface InputTeacherSearchProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onValidChange?: (isValid: boolean) => void;
  onSearch: () => void;
  placeholder?: string;
}

const InputTeacherSearch: React.FC<InputTeacherSearchProps> = ({
  label,
  value,
  onChangeText,
  onValidChange,
  onSearch,
  placeholder = 'Enter teacher name',
}) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const isValidLength = value.trim().length >= 3;
    setIsValid(isValidLength);
    onValidChange?.(isValidLength);
  }, [value, onValidChange]);

  return (
    <div className="relative w-full">
      <ThemedInput
        label={label}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && isValid && onSearch()}
        isValid={isValid}
        errorMessage="Name must be at least 3 characters long"
      />
      <button
        onClick={onSearch}
        className="absolute right-3 top-12 transform -translate-y-1/2 p-1"
        disabled={!isValid}
      >
        <span className="material-icons" 
        // style={{ color: isValid ? colors.neutralTextSecondary : colors.neutralTextTertiary }}
        >
          search
        </span>
      </button>
    </div>
  );
};

export default InputTeacherSearch;