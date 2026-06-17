import './Button.css';

type ButtonVariant = 'primary' | 'outline' | 'cta';

type ButtonProps = {
  variant: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
};

export const Button = ({ variant, children, onClick, href, className }: ButtonProps) => {
  const classes = `btn btn--${variant}${className ? ` ${className}` : ''}`;

  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type='button' onClick={onClick}>
      {children}
    </button>
  );
};
