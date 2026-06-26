import './Button.css';

type ButtonVariant = 'primary' | 'outline' | 'cta';

export type ButtonProps = {
  variant: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

export const Button = ({ variant, children, onClick, className }: ButtonProps) => {
  const classes = `btn btn--${variant}${className ? ` ${className}` : ''}`;
  return (
    <button className={classes} type='button' onClick={onClick}>
      {children}
    </button>
  );
};
