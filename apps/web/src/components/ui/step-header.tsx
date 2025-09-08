interface StepHeaderProps {
  stepNumber: number;
  title: string;
}

/**
 * Component for rendering conversion step headers with dynamic numbering
 */
export function StepHeader({ stepNumber, title }: StepHeaderProps) {
  return (
    <div className="px-4 py-3 border-b bg-muted/50">
      <h3 className="text-sm font-medium">
        {stepNumber}. {title}
      </h3>
    </div>
  );
}
