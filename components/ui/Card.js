const SIZE_CLASSES = {
  xl: "rounded-[28px] px-4 py-7 sm:px-8",
  lg: "rounded-[28px] px-4 py-[22px] sm:px-6",
  md: "rounded-[24px] px-4 py-6 sm:px-7",
  sm: "rounded-[22px] px-[22px] py-5",
  xs: "rounded-[18px] px-4 py-3.5",
};

export default function Card({
  as: Component = "div",
  size = "lg",
  className = "",
  children,
  ...rest
}) {
  return (
    <Component
      className={`min-w-0 bg-white ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
