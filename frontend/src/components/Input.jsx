import { InputStyled } from "./auth/AuthStyles";

export const Input = ({
  className = "",
  label,
  id,
  type = "text",
  placeholder,
  error,
  disabled = false,
  ...rest
}) => {
  return (
    <div className={className}>
      {!!label && (
        <label className="text-white" htmlFor={id}>
          {label}
        </label>
      )}
      <InputStyled
        id={id}
        type={type}
        placeholder={placeholder}
        {...rest}
        disabled={disabled}
      />
      {!!error && (
        <p className="text-red-500 font-600 text-15 mt-10">{error}</p>
      )}
    </div>
  );
};
