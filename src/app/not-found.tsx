import { NotFoundState } from "@/components/shared/states"

export default function NotFound() {
  return (
    <NotFoundState
      entity="Página"
      message="Página não encontrada"
      backLink="/"
      backText="Voltar para organizações"
    />
  )
}
