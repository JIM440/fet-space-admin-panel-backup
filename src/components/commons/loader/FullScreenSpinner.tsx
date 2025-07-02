import React from "react";
import ContentContainer from "../containers/ContentContainer";

const FullScreenSpinner: React.FC = () => {
  return (
    <ContentContainer>
      <div className="flex flex-1 items-center justify-center h-full min-h-[calc(100vh-100px)]">
        <div className="w-10 h-10 md:w-12 md:h-12 border-3 md:border-4 border-primary-base border-t-transparent rounded-full animate-spin"></div>
      </div>
    </ContentContainer>
  );
};

export default FullScreenSpinner;
