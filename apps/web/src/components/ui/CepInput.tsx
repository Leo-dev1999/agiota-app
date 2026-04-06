import { useState, ChangeEvent } from 'react'

interface ViaCepResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface AddressResult {
  street: string
  neighborhood: string
  city: string
  state: string
}

interface CepInputProps {
  onAddressFound: (address: AddressResult) => void
  onClear: () => void
}

function applyCepMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function CepInput({ onAddressFound, onClear }: CepInputProps) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const masked = applyCepMask(e.target.value)
    setCep(masked)
    setError('')
    // Se o usuário apagou, limpa o endereço
    if (masked.replace(/\D/g, '').length < 8) {
      onClear()
    }
  }

  async function handleBlur() {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data: ViaCepResponse = await res.json()

      if (data.erro) {
        setError('CEP não encontrado')
        onClear()
        return
      }

      onAddressFound({
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      })
    } catch {
      setError('Erro ao buscar CEP. Verifique sua conexão.')
      onClear()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={cep}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="00000-000"
          maxLength={9}
          className="input pr-8"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">
            ⏳
          </span>
        )}
        {!loading && cep.replace(/\D/g, '').length === 8 && !error && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">✓</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}
