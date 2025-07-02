import { Button } from "@/components/ui/button";
import ThemedText from "../typography/ThemedText";
import ContentContainer from "../containers/ContentContainer";

// Reusable ErrorComponent
interface ErrorComponentProps {
  message: string;
  onRetry: () => void;
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  message,
  onRetry,
}) => (
  <ContentContainer>
    <div className="text-center py-6">
      <ThemedText className="text-red-500 mb-4">
        {message || "Failed to load data"}
      </ThemedText>
      <Button variant="link" onClick={onRetry} className="px-4 py-2">
        Retry
      </Button>
    </div>
  </ContentContainer>
);

export default ErrorComponent;
