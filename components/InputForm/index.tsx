import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import styles from './styles.module.css';

interface BaseInputFormProps {
  label: string;
  name?: string;
  error?: FieldError;
  required?: boolean;
}

type InputFormProps = BaseInputFormProps &
  (
    | ({
        type?: 'text' | 'number' | 'email' | 'url' | 'password';
      } & InputHTMLAttributes<HTMLInputElement>)
    | ({
        type: 'select';
        options: Array<{ value: string; label: string }>;
      } & SelectHTMLAttributes<HTMLSelectElement>)
  );

export default function InputForm({
  label,
  name,
  error,
  required = false,
  type = 'text',
  ...props
}: InputFormProps) {
  const inputId = name ? `input-${name}` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label} {required && '*'}
      </label>

      {type === 'select' && 'options' in props ? (
        <select
          id={inputId}
          name={name}
          className={styles.select}
          {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {props.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          name={name}
          type={type}
          className={styles.input}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && <span className={styles.fieldError}>{error.message}</span>}
    </div>
  );
}
