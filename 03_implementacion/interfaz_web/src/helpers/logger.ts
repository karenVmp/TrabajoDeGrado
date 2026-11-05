import { COLORS } from '@/constants/colors'

export const logger = (message: string, color?: string) => {
  console.log(
    `%c${message}`,
    `background: ${color ?? COLORS.SKY}; color: white; font-weight: bold; padding: 2px 4px; border-radius: 4px;`
  )
}
