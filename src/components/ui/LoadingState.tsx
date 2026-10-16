type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div role="status" className="font-sans text-sm text-dust">
      {label}
    </div>
  );
}
