import { NotFoundState } from "@/components/shared/states"

export default function NotFound() {
  return (
    <NotFoundState
      entity="Página"
      message="Página não encontrada"
      backLink="/org"
      backText="Voltar para organizações"
    />
  )
}
