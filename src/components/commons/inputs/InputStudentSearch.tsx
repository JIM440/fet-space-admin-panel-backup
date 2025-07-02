import React, { useEffect, useState } from 'react';
import ThemedInput from './ThemedInput';

interface InputStudentSearchProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onValidChange?: (isValid: boolean) => void;
  onSearch: () => void;
  placeholder?: string;
}

const InputStudentSearch: React.FC<InputStudentSearchProps> = ({
  label,
  value,
  onChangeText,
  onValidChange,
  onSearch,
  placeholder = 'Enter matricule or name',
}) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = value.trim().length > 0;
    setIsValid(valid);
    onValidChange?.(valid);
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
        errorMessage="Enter at least one character to search"
      />
      <button
        onClick={onSearch}
        className="absolute right-3 top-12 transform -translate-y-1/2 p-1"
        disabled={!isValid}
      >
        <span className="material-icons" 
        // style={{ color: colors.neutralTextSecondary }}
        >
          search
        </span>
      </button>
    </div>
  );
};

export default InputStudentSearch;