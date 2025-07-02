import React, { useEffect } from 'react';
import ThemedText from '../typography/ThemedText';

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  style?: React.CSSProperties;
  errorMessage?: string;
  isValid?: boolean;
  onValidChange?: (isValid: boolean) => void;
}

const ThemedInput: React.FC<ThemedInputProps> = ({
  label,
  placeholder,
  style,
  value,
  onChange,
  errorMessage,
  isValid = true,
  onValidChange,
  ...rest
}) => {

  const inputStyle = {
    // backgroundColor: colors.backgroundNeutral,
    // borderColor: isValid
    //   ? colors.backgroundNeutral
    //   : value && value.length > 0
    //   ? colors.error
    //   : colors.backgroundNeutral,
    ...style,
  };

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid, onValidChange]);

  return (
    <div className="mb-4 w-full">
      <ThemedText variant="body" className="mb-2">
        {label ? `${label}:` : ''}
      </ThemedText>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border border-neutral-border rounded-lg text-neutral-text-secondary"
        style={inputStyle}
        {...rest}
      />
      {!isValid && errorMessage && value && value.length > 0 && (
        <ThemedText variant="small" className="text-red-500 mt-1">
          {errorMessage}
        </ThemedText>
      )}
    </div>
  );
};

export default ThemedInput;