import { forwardRef, ChangeEvent } from 'react'

function applyPhoneMask(value: string): string {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  // 11 dígitos — celular: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (rawValue: string) => void
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value, ...props }, ref) => {
    function handleChange(e: ChangeEvent<HTMLInputElement>) {
      const masked = applyPhoneMask(e.target.value)
      // Atualiza o display com a máscara
      e.target.value = masked
      // Envia só os dígitos para o react-hook-form / estado externo
      onChange?.(masked.replace(/\D/g, ''))
    }

    // Formata o valor inicial se vier do estado externo
    const displayValue = typeof value === 'string' ? applyPhoneMask(value) : value

    return (
      <input
        {...props}
        ref={ref}
        type="tel"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder="(11) 99999-9999"
        maxLength={16}
        className="input"
      />
    )
  }
)

PhoneInput.displayName = 'PhoneInput'
