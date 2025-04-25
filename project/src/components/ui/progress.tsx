import * as React from "react";

interface ProgressProps {
  value?: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className, indicatorClassName }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
      >
        <div
          className={indicatorClassName}
          style={{ width: `${value}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress }; 