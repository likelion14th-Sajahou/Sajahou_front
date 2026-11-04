const SIZE_CLASSES = {
  lg: "rounded-[28px] px-6 py-[22px]",
  md: "rounded-[24px] px-7 py-6",
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
      className={`bg-white ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
