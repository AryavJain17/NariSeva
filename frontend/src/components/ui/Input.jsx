const Input = ({ label, id, name, type = 'text', value, onChange, required = false, className = '', ...props }) => {
    return (
      <div className={className}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          {...props}
        />
      </div>
    );
  };
  
  export default Input;