import React, { type ReactNode } from "react";

interface ContentContainersProps {
  children: ReactNode;
}

const ContentContainer: React.FC<ContentContainersProps> = ({ children }) => {
  return (
    <div className="max-w-[900px] mx-auto p-[16px] [@media(min-width:300px)]:p-[20px] md:mt-[42px] lg:mt-[60px] bg-background-main">
      {children}
    </div>
  );
};

export default ContentContainer;
