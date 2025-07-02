import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ThemedText from "@/components/commons/typography/ThemedText";

interface BackHeaderProps {
  title: string;
  backUrl?: string;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, backUrl }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-neutral-text-secondary"
      >
        <ArrowLeft className="w-5 h-5" />
        <ThemedText variant="h4">{title}</ThemedText>
      </button>
    </div>
  );
};

export default BackHeader;