import React from "react";

const InlineSpinner: React.FC = () => {
  return (
      <div className="flex items-center justify-center w-full h-36 p-4">
        <div className="w-8 h-8 border-3 border-primary-base border-t-transparent rounded-full animate-spin"></div>
      </div>
  );
};

export default InlineSpinner;
